1. cmd > ipconfig > take Wireless Lan adapter Wifi: IPv4 Address should be replaced to <your-ip>
   Update .env file REACT_APP_API_URL value to http://<your-ip>:5000/api

2. change MACHINE_IP value to <your-ip> in config/constants

3. Run this command on Terminal > npm run dev