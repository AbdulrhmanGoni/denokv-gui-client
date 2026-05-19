-- migrate:up
UPDATE kvStores 
SET 
  createdAt = strftime('%Y-%m-%dT%H:%M:%SZ', createdAt),
  updatedAt = strftime('%Y-%m-%dT%H:%M:%SZ', updatedAt)
WHERE createdAt NOT LIKE '%Z' OR updatedAt NOT LIKE '%Z';

UPDATE browsingParams 
SET 
  createdAt = strftime('%Y-%m-%dT%H:%M:%SZ', createdAt),
  updatedAt = strftime('%Y-%m-%dT%H:%M:%SZ', updatedAt)
WHERE createdAt NOT LIKE '%Z' OR updatedAt NOT LIKE '%Z';

-- migrate:down
UPDATE kvStores 
SET 
  createdAt = datetime(createdAt),
  updatedAt = datetime(updatedAt)
WHERE createdAt LIKE '%Z' OR updatedAt LIKE '%Z';

UPDATE browsingParams 
SET 
  createdAt = datetime(createdAt),
  updatedAt = datetime(updatedAt)
WHERE createdAt LIKE '%Z' OR updatedAt LIKE '%Z';
