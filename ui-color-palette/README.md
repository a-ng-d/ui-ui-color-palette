# Auth UI Color Palette

This repository contains a form built using React and Supabase Auth for authenticating users to access a UI color palette.

## Features

- User authentication with Supabase
- React-based form for user login and registration
- Access to a customizable UI color palette upon successful authentication

## Installation

1. Clone the repository:
  ```bash
  git clone https://github.com/a-ng-d/auth-ui-color-palette.git
  ```
2. Navigate to the project directory:
  ```bash
  cd auth-ui-color-palette
  ```
3. Install the dependencies:
  ```bash
  npm install
  ```

## Configuration

1. Create a `.env.development.local` file in the root directory and add your Supabase credentials:
  ```env
  REACT_APP_SUPABASE_URL=your-supabase-url
  REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
  REACT_APP_WORKER_URL=http://localhost:8787
  ```

## Usage

1. Start the development server:
  ```bash
  npm run dev
  ```
2. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
