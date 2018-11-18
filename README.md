# YT-Server

## Description
REST API to handle database for Youtube Frontpage.

##### Routing         : Express
##### ORM Database    : Sequelize
##### Authentication  : Passport, JWT

## Installation

#### Download Code | Clone the Repo

```
git clone {repo_name}
```

#### Install Dependencies
```
npm install
```

#### MySQL Server
If MySQL Server does not exist it will have to be installed as well. 
You can download that installer [here](https://dev.mysql.com/downloads/mysql/) (I recommend installing MySQL Workbench as well).
Sequelize requires the use of mysql native passwords so either install with legacy passwords or [alter the user to use native passwords](https://stackoverflow.com/a/50035703).

#### Create .env File
You will find a example.env file in the home directory. Paste the contents of that into a file named .env in the same directory. 
Fill in the variables to fit your application

