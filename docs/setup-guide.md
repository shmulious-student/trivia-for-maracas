# MongoDB Atlas Setup Guide

This guide will walk you through setting up a free MongoDB Atlas account and getting your connection string.

## Step 1: Create an Account
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  Sign up for a free account (you can use Google Sign-in).
3.  Accept the terms and complete the registration.

## Step 2: Create a Cluster
1.  Once logged in, you will be prompted to build a database.
2.  Choose the **M0 Free** tier.
3.  Select a provider (AWS is fine) and a region close to you (e.g., `eu-central-1` for Frankfurt if you are in Israel/Europe).
4.  Give your cluster a name (e.g., `TriviaCluster`) or leave it as `Cluster0`. dev notes: I set the name to be "TriviaCluster0".
5.  Click **Create**.

## Step 3: Setup Security
1.  **Username and Password**:
    -   You will be asked to create a database user.
    -   Enter a username (e.g., `admin`). dev notes: I set the username to be "shmulious_db_user".
    -   Enter a strong password. **Write this down!** You will need it for the connection string.
    -   Click **Create User**.
2.  **IP Access List**:
    -   Select **My Local Environment**.
    -   Add your current IP address.
    -   **Crucial**: To allow the app to run from anywhere (or if your IP changes), you might want to add `0.0.0.0/0` (Allow Access from Anywhere) for development ease, though it's less secure. For now, adding your current IP is safer.
    -   Click **Finish and Close**.

## Step 4: Get Connection String
1.  Go to the **Database** view (left sidebar).
2.  Click **Connect** on your cluster.
3.  Choose **Drivers**.
4.  Select **Node.js** as the driver and version **5.5 or later**.
5.  Copy the connection string. It will look like this:
    `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=TriviaCluster`

## Step 5: Configure Project
1.  Create a file named `.env` in the `server` directory: `/Users/shmuelvachnish-mbpr/Projects/GitHub/trivia/trivia-for-maracas/server/.env`
2.  Add the following line, replacing `<password>` with the password you created in Step 3:
    ```env
    MONGODB_URI=mongodb+srv://shmulious_db_user:<db_password>@triviacluster0.br8dnue.mongodb.net/?appName=TriviaCluster0&retryWrites=true&w=majority
    ```
    *(Note: I added `/trivia` after the hostname to specify the database name)*

## Step 6: Verify
Once you have added the `.env` file, let me know, and I will verify the connection.
