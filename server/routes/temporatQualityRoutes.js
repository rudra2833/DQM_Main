const temporalQualityController = require('../controllers/temporalQualityController');
const express = require('express');
const router = express.Router();

router.post('/temporal-val', temporalQualityController.temporalVal)
router.post('/tempoconist', temporalQualityController.tempoConistency)
router.post('/tempoValidity', temporalQualityController.tempoValidity)
router.post('/tempoStartEnd', temporalQualityController.tempoStartend)

router.post('/tempoValidity/save', temporalQualityController.saveLogs)
router.get('/tempoValidity/logs', temporalQualityController.getLogs)

router.post('/tempoStartEnd/save', temporalQualityController.twoDatesaveLogs)
router.get('/tempoStartEnd/logs', temporalQualityController.twoDategetLogs)



module.exports = router;