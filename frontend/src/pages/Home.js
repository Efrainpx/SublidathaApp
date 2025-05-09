// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-blue-600 min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold text-white">
        Bienvenido a SublidathaPro
      </h1>
      <p className="text-lg md:text-2xl text-gray-200 mt-4 max-w-xl">
        Descubre productos personalizados de sublimación y gestiona tu compra de
        forma fácil y rápida.
      </p>
      <Link
        to="/catalogo"
        className="bg-white text-blue-600 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition mt-8"
      >
        Ver Catálogo
      </Link>
    </div>
  );
};

export default Home;
