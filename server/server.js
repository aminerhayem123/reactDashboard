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
  const { brand, price } = req.body;

  // Handle items as either comma-separated string or array
  let items = req.body.items;
  if (typeof items === 'string') {
    items = items.split(',').map(item => item.trim());
  } else if (!Array.isArray(items)) {
    items = [];
  }

  if (!brand || !items.length || !price) {
    return res.status(400).json({ message: 'Brand, items, and price are required' });
  }

  const images = req.files;

  const status = 'Not Sold';

  try {
    const client = await pool.connect();

    const randomLetters = [...Array(3)].map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const packId = `${randomLetters}${randomNumber}`;

    const result = await client.query(
      'INSERT INTO packs (id, brand, price, status) VALUES ($1, $2, $3, $4) RETURNING id, created_date',
      [packId, brand, parseFloat(price), status]
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

// Endpoint to add a new item to a pack
app.post('/packs/:id/items', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const client = await pool.connect();

    // Get the current number of items for the pack
    const itemCountQuery = 'SELECT COUNT(*) FROM items WHERE pack_id = $1';
    const itemCountResult = await client.query(itemCountQuery, [id]);
    const itemCount = parseInt(itemCountResult.rows[0].count);

    // Generate the item ID using the pack ID and the next available number
    let newItemId;
    let foundNewId = false;
    let i = 1;
    do {
      newItemId = `${id}${String(itemCount + i).padStart(5, '0')}`;
      const checkItemIdQuery = 'SELECT id FROM items WHERE id = $1';
      const checkItemIdResult = await client.query(checkItemIdQuery, [newItemId]);
      if (checkItemIdResult.rows.length === 0) {
        foundNewId = true;
      }
      i++;
    } while (!foundNewId);

    // Insert the item into the database
    const insertItemQuery = 'INSERT INTO items (id, name, pack_id) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(insertItemQuery, [newItemId, name, id]);
    const newItem = result.rows[0];

    client.release();

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error adding item:', err);
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
      await client.query('DELETE FROM transactions WHERE pack_id = $1', [packId]);
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

    // Get pack_id and position of the item being deleted
    const packIdQuery = 'SELECT pack_id FROM items WHERE id = $1';
    const packIdResult = await client.query(packIdQuery, [id]);
    const packId = packIdResult.rows[0].pack_id;

    // Delete the item
    await client.query('DELETE FROM items WHERE id = $1', [id]);

    // Fetch all remaining items in the pack and update their IDs sequentially
    const fetchItemsQuery = 'SELECT id FROM items WHERE pack_id = $1 ORDER BY id';
    const fetchItemsResult = await client.query(fetchItemsQuery, [packId]);
    const items = fetchItemsResult.rows;

    // Update items in a batch to ensure sequential IDs
    for (let i = 0; i < items.length; i++) {
      const newId = `${packId}${String(i + 1).padStart(5, '0')}`;
      await client.query('UPDATE items SET id = $1 WHERE id = $2', [newId, items[i].id]);
    }

    client.release();

    res.json({ message: 'Item deleted successfully', remainingItems: items.length });
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

// Route to filter items by name or ID
app.get('/items/search', (req, res) => {
  const { q } = req.query; // Assuming 'q' is the search query
  if (!q) {
    res.status(400).json({ message: 'Search query parameter "q" is required' });
    return;
  }
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(q.toLowerCase()) ||
    item.id.toString().toLowerCase().includes(q.toLowerCase())
  );
  res.json(filteredItems);
});

app.post('/packs/:id/sold', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();

    // Fetch pack details
    const packQuery = 'SELECT * FROM packs WHERE id = $1';
    const packResult = await client.query(packQuery, [id]);
    const pack = packResult.rows[0];

    if (!pack) {
      client.release();
      return res.status(404).json({ message: 'Pack not found' });
    }

    // Calculate profit (assuming profit is amount received - pack price)
    const { price } = pack;
    const { amount } = req.body;

    // Validate 'amount' to ensure it's a valid number
    if (!parseFloat(amount)) {
      client.release();
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const profit = parseFloat(amount) - parseFloat(price);

    // Insert transaction into database
    const insertTransactionQuery = `
      INSERT INTO transactions (pack_id, amount, profit)
      VALUES ($1, $2, $3)
      RETURNING id, sale_date
    `;
    const transactionResult = await client.query(insertTransactionQuery, [id, parseFloat(amount), profit]);
    const { id: transactionId, sale_date } = transactionResult.rows[0];

    // Update pack status to 'Sold' in the packs table
    const updatePackQuery = 'UPDATE packs SET status = $1 WHERE id = $2';
    await client.query(updatePackQuery, ['Sold', id]);

    client.release();

    res.json({ message: 'Pack marked as sold successfully' });
  } catch (error) {
    console.error('Error marking pack as sold:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to fetch transactions
app.get('/transactions', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, pack_id, sale_date, amount, profit FROM transactions');
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();

    // Fetch transaction details to find the pack_id
    const transactionQuery = 'SELECT * FROM transactions WHERE id = $1';
    const transactionResult = await client.query(transactionQuery, [id]);
    const transaction = transactionResult.rows[0];

    if (!transaction) {
      client.release();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { pack_id } = transaction;

    // Delete transaction from database
    const deleteTransactionQuery = 'DELETE FROM transactions WHERE id = $1';
    await client.query(deleteTransactionQuery, [id]);

    // Check if there are any remaining transactions for the same pack_id
    const remainingTransactionsQuery = 'SELECT * FROM transactions WHERE pack_id = $1';
    const remainingTransactionsResult = await client.query(remainingTransactionsQuery, [pack_id]);
    const remainingTransactions = remainingTransactionsResult.rows;

    // Update pack status based on remaining transactions
    const updatePackQuery = `
      UPDATE packs SET status = $1 WHERE id = $2
    `;

    if (remainingTransactions.length === 0) {
      // No remaining transactions, set pack status to 'Not Sold'
      await client.query(updatePackQuery, ['Not Sold', pack_id]);
    } else {
      // There are remaining transactions, keep pack status as 'Sold'
      await client.query(updatePackQuery, ['Sold', pack_id]);
    }

    client.release();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/packs/count', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT COUNT(*) FROM packs');
    const packCount = parseInt(result.rows[0].count);
    client.release();
    res.json({ count: packCount });
  } catch (error) {
    console.error('Error fetching pack count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/packs/Sold', async (req, res) => {
  try {
    const client = await pool.connect();

    // Query to get count of sold packs
    const result = await client.query('SELECT COUNT(*) FROM packs WHERE Status = $1', ['Sold']);
    const packSold = parseInt(result.rows[0].count, 10);

    // Query to get total count of all packs
    const totalResult = await client.query('SELECT COUNT(*) FROM packs');
    const totalCount = parseInt(totalResult.rows[0].count, 10);

    client.release();

    // Calculate percentage of sold packs
    let percentageSold = 0;
    if (totalCount > 0) {
      percentageSold = (packSold / totalCount) * 100;
    }

    res.json({ count: packSold, percentage: percentageSold });
  } catch (error) {
    console.error('Error fetching pack count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
