### For First-Time Setup (with package installation)
If you're using the project for the first time, just type:
    npm i
    npm run new

This will install all the necessary npm packages and start the application.

---

### To Start the App (without re-installing packages)
If you've already installed the packages before, simply run:

    npm start

This will start the project directly without downloading anything new.

---

### If you want to start the server, client, pyServer separately, open two terminals and run the following in each:

- In the server terminal:
    cd (to node server)
    npm i
    npm start

- In the client terminal:
    cd (to client server)
    npm i
    npm start

- In the py teminal:
    cd (to python server)
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    pip install flask_cors
    pip install shapefile 
    pip install shapely
    pip install pyshp
    pip install ultralytics
    python app.py

---

### Console Info
When the app runs, the terminal shows two logs:

- `[0]` → Server-side output  
- `[1]` → Client-side output

So you can easily track what's happening on each end.

---

#### Before You Start – Set Up .env File
Make sure to create a .env file inside the server folder before running the app. It should look like this:

dbpassword=<Your Database Password>
db1=DQM_db_final
db2=absolute_position_accuracy_a
db3=relative_positional_accuracy_a
db4=FPS_Bihar
PORT=3001

Use the exact database names as given above to avoid connection issues.

### Database Setup
Add 4 database as given in the Database Folder (By selecting restore data in respective database in pgadmin)

