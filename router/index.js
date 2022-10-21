const express = require('express');
let router = express.Router();
let render = require('../get');
router.get('/pic', async (req, res) => {
  const count = req?.query?.count || 6;
  res.send(await render(count));
});

module.exports = router;
