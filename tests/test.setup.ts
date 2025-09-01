process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '4000';

// Prevent swagger from trying to parse files if it depends on FS; rely on route-level since we import app builder.
