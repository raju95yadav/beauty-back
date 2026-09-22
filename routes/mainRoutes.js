const express = require('express');
const {
  subscribeNewsletter,
  checkNewsletterStatus,
  unsubscribeNewsletter,
  getSupportContent,
  getAboutContent,
  getJobs,
  submitContactForm,
  getAdminContact
} = require('../controllers/mainController');

const router = express.Router();

router.post('/newsletter', subscribeNewsletter);
router.get('/newsletter/status', checkNewsletterStatus);
router.post('/newsletter/unsubscribe', unsubscribeNewsletter);
router.get('/support/:type', getSupportContent);
router.get('/about', getAboutContent);
router.get('/jobs', getJobs);
router.post('/contact', submitContactForm);
router.get('/admin-contact', getAdminContact);

module.exports = router;
