[![Netlify Status](https://api.netlify.com/api/v1/badges/41f87c3f-262a-48ee-b5e6-94a4930a7af8/deploy-status)](https://app.netlify.com/sites/auth-ideas-spark-booth/deploys)

# Auth Ideas Spark Booth

This repository contains a form built using NextJS, React and Supabase Auth for authenticating users to access Yelbolt products.

## Features

- User authentication with Supabase
- React-based form for user login and registration
- Access to a customizable Ideas Spark Booth upon successful authentication

## Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/a-ng-d/auth-yelbolt.git
  ```
2. Navigate to the project directory:
  ```bash
  cd auth-yelbolt
  ```
3. Install the dependencies:
  ```bash
  npm run install
  ```

## Configuration

1. Create a `.env.development` file in the root directory and add your Supabase credentials:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
  NEXT_PUBLIC_WORKER_URL=http://localhost:8787
  ```

## Usage

1. Start the development server:
  ```bash
  npm run dev:ideas-spark-booth
  ```
2. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
