import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: "TMDB_MovieAPI",
    })
    .then(() => {
      console.log("Database Connected");
    })
    .catch((err) => {
      console.log("Connection Error : ", err);
    });
};
