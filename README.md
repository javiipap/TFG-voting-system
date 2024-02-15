**TFG (Final Degree Project) - Blockchain-Based Voting System**

## Overview

This project aims to design and implement a secure voting system using blockchain technology and homomorphic encryption. The system ensures transparency, anonymity, and integrity of the voting process by leveraging blockchain's decentralized nature and homomorphic encryption's ability to perform computations on encrypted data.

## Features

- **Blockchain Integration**: Utilizes blockchain technology to store and manage voting data in a decentralized and tamper-proof manner.
- **Homomorphic Encryption**: Implements homomorphic encryption to perform vote tallying on encrypted ballots without decrypting them, ensuring voter privacy.
- **Next.js Frontend**: The frontend of the application is developed using Next.js, providing a fast and efficient user interface.
- **Dockerfile**: Includes a Dockerfile for easy deployment and containerization of the application.
- **AWS Deployment**: Provides a Serverless Application Model (SAM) configuration file for deploying the application on AWS using AWS Lambda and API Gateway.

## Technologies Used

- **Blockchain**: Utilizing a blockchain platform like Ethereum or Hyperledger for storing and managing voting data.
- **Homomorphic Encryption**: Implementing libraries or algorithms for homomorphic encryption to perform secure vote tallying.
- **Next.js**: A React framework for building efficient and scalable web applications.
- **Docker**: Containerization technology for packaging the application and its dependencies into a standardized unit.
- **AWS (Amazon Web Services)**: Cloud platform for deploying and hosting the application securely and scalably.

## Installation and Setup

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.
4. Follow additional setup instructions provided in the `README.md` file within the project directory.

## Usage

1. Start the application by running `npm start`.
2. Access the application through the provided URL.
3. Users can register, cast their votes, and view election results securely.

## Deployment

### Docker Deployment

1. Build the Docker image using the provided Dockerfile.
2. Deploy the Docker container to your preferred hosting environment.
3. The app will be listening on port 3000 by default.

### AWS Deployment

1. Configure AWS credentials on your local machine.
2. Deploy the application to AWS using the provided AWS SST configuration file: `npx sst deploy --stage prod`
3. The cloudfront URL will be provided upon successful deployment.

## Contribution Guidelines

Contributions to the project are welcome. Please follow these guidelines:

- Fork the repository and create a new branch for your feature or bug fix.
- Ensure that your code follows the project's coding style and conventions.
- Submit a pull request detailing the changes you've made.

## License

This project is licensed under the [MIT License](LICENSE).

## Authors

- Javier Padilla Pío - [alu0101410463@ull.edu.es](mailto:alu0101410463@ull.edu.es)

## Acknowledgements

Special thanks to my tutors Cándido Caballero Gil and Jezabel Molina-Gil for their contributions and support to this project.
