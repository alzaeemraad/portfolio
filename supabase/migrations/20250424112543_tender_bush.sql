/*
  # Create admin dashboard tables

  1. New Tables
    - `profile`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `name` (text)
      - `title` (text)
      - `bio` (text)
      - `location` (text)
      - `email` (text)
      - `phone` (text)
      - `github` (text)
      - `linkedin` (text)
      - `twitter` (text)
      - `instagram` (text)
      - `updated_at` (timestamptz)

    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `tags` (text[])
      - `demo_url` (text)
      - `repo_url` (text)
      - `featured` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `experience`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `description` (text)
      - `type` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Profile table
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name text,
  title text,
  bio text,
  location text,
  email text,
  phone text,
  github text,
  linkedin text,
  twitter text,
  instagram text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profile FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  tags text[],
  demo_url text,
  repo_url text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Experience table
CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text,
  start_date date NOT NULL,
  end_date date,
  description text,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experience entries are viewable by everyone"
  ON experience FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage experience"
  ON experience FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create initial profile for admin
INSERT INTO profile (user_id, name, title, bio, location, email)
SELECT 
  id,
  'John Doe',
  'Frontend Developer & UI/UX Designer',
  'Passionate developer with a keen eye for design and a love for creating exceptional user experiences.',
  'San Francisco, CA',
  email
FROM users
WHERE email = 'alzaeemraad9@gmail.com'
ON CONFLICT (user_id) DO NOTHING;