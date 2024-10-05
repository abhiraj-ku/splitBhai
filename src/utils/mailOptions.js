// custom mail options based on the params passed for different use cases
// separation of concerns

function mailOptions({ from, to, subject, text }) {
  const defaultFrom = 'noreply@splitbhai.com';
  if (!from || typeof from !== 'string') {
    from = defaultFrom;
  }
  if (!to || !to.email || typeof to.email !== 'string') {
    throw new Error('Invalid recipient email address.');
  }

  if (!subject || typeof subject !== 'string') {
    throw new Error('Invalid subject.');
  }
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid email body.');
  }

  // Safe email data to be returned
  return {
    from: from,
    to: to.email,
    subject: subject,
    text: text,
  };
}

module.exports = mailOptions;
