export const sanitizeData = (data, fieldsToMask = ['password', 'token', 'email']) => {
  const sanitized = { ...data };
  fieldsToMask.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***masked***';
    }
  });
  return sanitized;
}; 