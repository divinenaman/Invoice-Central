# Invoice Central: An invoicing Web App

An easy to use invoicing app to generate and manage invoices. It allows users to set up a shop, add products, generate invoices and share them with other users. The invoices are easily available on a public link, to both the customer and the vendor.

## Flow

1. Vendor
    - Login/Register
    - Set up shop  (```/shop/register```)
    - Add Products (```/products/add```)
    - Create Invoice (```/invoice```) : adding customer email, automatically shares the invoice.

2. Customer
    - Login/Register
    - Share email with vendor
    - Recieve Invoice

## Setup

### 0. Install node, npm and MongoDB
- Node & Npm: https://nodejs.org/en/
- MongoDB: https://www.mongodb.com/docs/manual/installation/


Note:
- MongoDB should be running on localhost port 27017, to change, edit [server.js](/server.js) line no. 19 
- Create ```invoiceCentral``` database in MongoDB, to change, edit [server.js](/server.js) line no. 19

### 1. Package Installation:

```
yarn or npm i
```

### 2. Start Server

```
yarn start or npm run start
```

## Routes

| Endpoints                        	| Types             	| Usage                        	|
|----------------------------------	|-------------------	|------------------------------	|
| /                                	| GET               	| Dashboard                    	|
| /login                           	| POST, GET, DELETE 	| Login Users                  	|
| /signup                          	| POST, GET         	| Signup Users                 	|
| /shop/register                   	| POST, GET         	| Set up shop                  	|
| /products/add                    	| POST, GET         	| Add products                 	|
| /products/search/:shopId?key=val 	| GET               	| Search products  using query 	|
| /invoice                         	| GET, POST         	| Generate invoice             	|
| /invoice/:invoiceId              	| GET               	| View invoice                 	|

## Learnings

- REST API
- MongoDB along with aggregation queries
- PassportJS with local strategy to authenticate users
- Puppeter
- HTTP Request Types
