CREATE TABLE IF NOT EXISTS shortlist_candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id VARCHAR(255) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  candidate_image VARCHAR(255),
  job_id VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  status VARCHAR(100) DEFAULT 'Shortlisted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
