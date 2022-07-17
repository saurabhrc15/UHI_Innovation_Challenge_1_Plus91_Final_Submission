const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const baseURL = "/api/v1";

router.get('/', (req, res) => {
  res.send("<h3>UHI Server<\h3>")
});

// router.get(`${baseURL}/nlp`, mainController.nlp);

// Callbacks from HSPA
router.post(`${baseURL}/on_search`, mainController.on_search);
router.post(`${baseURL}/on_confirm`, mainController.on_confirm);
router.post(`${baseURL}/on_init`, mainController.on_init);
router.post(`${baseURL}/on_select`, mainController.on_select);
router.post(`${baseURL}/on_status`, mainController.on_status);

// Calls from EUA
router.post(`${baseURL}/search`, mainController.search);
router.post(`${baseURL}/get_onSearchData`, mainController.get_onSearchData);
router.post(`${baseURL}/select`, mainController.select);
router.post(`${baseURL}/get_onSelectData`, mainController.get_onSelectData);
router.post(`${baseURL}/init`, mainController.init);
router.post(`${baseURL}/get_onInitData`, mainController.get_onInitData);
router.post(`${baseURL}/confirm`, mainController.confirm);
router.post(`${baseURL}/get_onConfirmData`, mainController.get_onConfirmData);

module.exports = router;