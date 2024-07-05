const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  connectionString: 'postgres://postgres:atrox123@localhost:5432/app',
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    client.release();

    if (!user || password !== user.password) {
      return res.status(400).json({ message: 'Email or password incorrect' });
    }

    res.json({ message: 'Login successful', token: 'dummy-token', user });
  } catch (error) {
    console.error('Error during login:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/packs', upload.array('images', 10), async (req, res) => {
  const { brand, items, price } = req.body;
  if (!brand || !items || !price) {
    return res.status(400).json({ message: 'Brand, items, and price are required' });
  }

  const images = req.files;

  try {
    const client = await pool.connect();

    const randomLetters = [...Array(3)].map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const packId = `${randomLetters}${randomNumber}`;

    const result = await client.query(
      'INSERT INTO packs (id, brand, price) VALUES ($1, $2, $3) RETURNING id, created_date',
      [packId, brand, price]
    );
    const { id: insertedPackId, created_date } = result.rows[0];

    const itemQueries = items.map((itemName, index) => {
      const itemId = `${packId}${String(index + 1).padStart(5, '0')}`;
      return client.query('INSERT INTO items (id, name, pack_id) VALUES ($1, $2, $3)', [itemId, itemName, insertedPackId]);
    });

    await Promise.all(itemQueries);

    const imageQueries = images.map((image) => {
      return client.query('INSERT INTO images (pack_id, data) VALUES ($1, $2)', [insertedPackId, image.buffer]);
    });

    await Promise.all(imageQueries);

    client.release();

    res.json({ message: 'Pack and items added successfully', packId, created_date });
  } catch (error) {
    console.error('Error during pack creation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


app.get('/packs', async (req, res) => {
  try {
    const client = await pool.connect();
    const packsResult = await client.query('SELECT * FROM packs');
    const packs = packsResult.rows;

    const itemsResult = await client.query('SELECT * FROM items');
    const items = itemsResult.rows;

    const imagesResult = await client.query('SELECT id, pack_id, encode(data, \'base64\') as data FROM images');
    const images = imagesResult.rows;

    const packsWithItemsAndImages = packs.map(pack => {
      return {
        ...pack,
        items: items.filter(item => item.pack_id === pack.id),
        images: images.filter(image => image.pack_id === pack.id).map(image => ({
          id: image.id,
          data: image.data
        }))
      };
    });

    client.release();
    res.json(packsWithItemsAndImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/packs/:id/items', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const client = await pool.connect();

    // Get the current number of items for the pack
    const itemCountQuery = 'SELECT COUNT(*) FROM items WHERE pack_id = $1';
    const itemCountResult = await client.query(itemCountQuery, [id]);
    const itemCount = parseInt(itemCountResult.rows[0].count);

    // Generate the item ID using the pack ID and the current item count
    const itemId = `${id}${String(itemCount + 1).padStart(5, '0')}`;

    const insertItemQuery = 'INSERT INTO items (id, name, pack_id) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(insertItemQuery, [itemId, name, id]);
    const newItem = result.rows[0];
    client.release();

    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();

    // Get pack_id for cascading deletion
    const packIdQuery = 'SELECT pack_id FROM items WHERE id = $1';
    const packIdResult = await client.query(packIdQuery, [id]);
    const packId = packIdResult.rows[0].pack_id;

    // Delete the item
    await client.query('DELETE FROM items WHERE id = $1', [id]);

    // Check if the pack has any remaining items
    const itemCountQuery = 'SELECT COUNT(*) FROM items WHERE pack_id = $1';
    const itemCountResult = await client.query(itemCountQuery, [packId]);
    const remainingItemCount = parseInt(itemCountResult.rows[0].count);

    // If no items remain in the pack, delete the pack
    if (remainingItemCount === 0) {
      // Delete associated images due to ON DELETE CASCADE
      await client.query('DELETE FROM images WHERE pack_id = $1', [packId]);

      // Delete the pack itself
      await client.query('DELETE FROM packs WHERE id = $1', [packId]);
    }

    client.release();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/items', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM items');
    const items = result.rows;
    client.release();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();

    // Get pack_id for cascading deletion
    const packIdQuery = 'SELECT pack_id FROM items WHERE id = $1';
    const packIdResult = await client.query(packIdQuery, [id]);
    const packId = packIdResult.rows[0].pack_id;

    // Delete the item
    await client.query('DELETE FROM items WHERE id = $1', [id]);

    // Check if the pack has any remaining items
    const itemCountQuery = 'SELECT COUNT(*) FROM items WHERE pack_id = $1';
    const itemCountResult = await client.query(itemCountQuery, [packId]);
    const remainingItemCount = parseInt(itemCountResult.rows[0].count);

    // If no items remain in the pack, delete the pack
    if (remainingItemCount === 0) {
      await client.query('DELETE FROM packs WHERE id = $1', [packId]);
      
      // Also delete associated images due to ON DELETE CASCADE
      await client.query('DELETE FROM images WHERE pack_id = $1', [packId]);
    }

    client.release();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/images/delete', async (req, res) => {
  const { imageIds } = req.body;

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return res.status(400).json({ message: 'Invalid image IDs.' });
  }

  try {
    const client = await pool.connect();
    const deleteImagesQuery = 'DELETE FROM images WHERE id = ANY($1::int[])';
    const result = await client.query(deleteImagesQuery, [imageIds]);
    client.release();

    res.json({ message: 'Images deleted successfully', deletedCount: result.rowCount });
  } catch (err) {
    console.error('Error deleting images:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
