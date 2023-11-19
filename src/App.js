import React, { useState, useEffect } from "react";
import * as Realm from "realm-web";

const app = new Realm.App({ id: "application-0-uiref" });

const App = () => {
    const [user, setUser] = useState();
    const [activeDevelopers, setActiveDevelopers] = useState([]);

    useEffect(() => {
        const login = async () => {
            try {
                const user = await app.logIn(Realm.Credentials.anonymous());
                setUser(user);

                const mongodb = app.currentUser.mongoClient("mongodb-atlas");
                const collection = mongodb.db("Score-estimation-core").collection("teams");

                // Watch for changes in the 'teams' collection
                for await (const change of collection.watch()) {
                    const activeDev = change.fullDocument?.developers.filter(
                        (developer) => developer.status === "ACTIVE"
                    );
                    setActiveDevelopers(activeDev || []);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };
        login();
    }, []);

    return (
        <div className="App">
            {!!user && (
                <div className="App-header">
                    <h1>Connected as user {user.id}</h1>
                    <div>
                        <p>Active Developers:</p>
                        <ul>
                            {activeDevelopers.map((developer, index) => (
                                <li key={index}>{developer.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
