import React from "react";
import "./style.css";
import { NavLink } from "react-router-dom";

export const Erreur: React.FC = () => {
  return (
    <>
      <div className="container">
        <h1>Salut 👋 !, Vous êtes perdu ?</h1>

        <p>Cette route n'existe pas</p>

        <NavLink to={"/"}>Rentrer à la page d'acceuil</NavLink>
      </div>
    </>
  );
};
