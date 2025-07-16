import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export const Erreur: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Illustration ou emoji */}
        <div className="text-9xl mb-6" role="img" aria-label="Face avec un bandage">
          🤕
        </div>

        {/* Titre avec animation */}
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          animate={{ 
            x: [0, -10, 10, -5, 5, 0],
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          Oups ! 404
        </motion.h1>

        {/* Message d'erreur humoristique */}
        <p className="text-xl mb-6">
          On dirait que cette page a pris une pause café... 
          <br />
          Ou peut-être qu'elle est partie en vacances sans nous prévenir !
        </p>

        {/* Liste des possibilités */}
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-8 text-left max-w-md mx-auto">
          <p className="font-semibold mb-2">Que s'est-il passé ?</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Vous avez peut-être fait une faute de frappe</li>
            <li>La page a été déplacée ou supprimée</li>
            <li>Notre serveur fait la sieste</li>
            <li>Les hamsters qui alimentent le site sont en grève</li>
          </ul>
        </div>

        {/* Bouton de retour custom */}
        <NavLink to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-6 py-3 bg-blue-600 text-white font-medium rounded-lg overflow-hidden group"
          >
            <span className="relative z-10">Retour à la page d'accueil</span>
            <span className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </motion.button>
        </NavLink>

        {/* Petit message rigolo en bas */}
        <p className="mt-8 text-sm text-gray-400">
          PS: On a cherché partout, même sous le tapis... rien !
        </p>
      </motion.div>
    </div>
  );
};