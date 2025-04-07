import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./historique.css";

const Historique = () => {
  const [historique, setHistorique] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistorique = JSON.parse(localStorage.getItem("historique_reclamations")) || [];
    const savedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
    setHistorique(savedHistorique);
    setDemandes(savedDemandes);
  }, []);

  const restaurerDemande = (index) => {
    const demandeRestoree = { ...historique[index], status: "pending" };
    const updatedDemandes = [...demandes, demandeRestoree];
    localStorage.setItem("demandes", JSON.stringify(updatedDemandes));
    setDemandes(updatedDemandes);

    const newHistorique = historique.filter((_, i) => i !== index);
    localStorage.setItem("historique_reclamations", JSON.stringify(newHistorique));
    setHistorique(newHistorique);
  };

  return (
    <div className="admin-container">
      <h2>Historique des Demandes</h2>
      <button className="back-btn" onClick={() => navigate("/admin")}>
        <i className="fas fa-arrow-left"></i> Retour
      </button>

      {historique.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-inbox"></i>
          <p>Aucune demande rejetée</p>
        </div>
      ) : (
        historique.map((demande, index) => (
          <div className="demande-carde" key={index}>
            <div className="demande-header">
              <h3>{demande.nom}</h3>
              <span className="status-badge status-rejected">Refusée</span>
            </div>
            <p><strong>Type:</strong> {demande.typeReclamation}</p>
            <p><strong>Motif:</strong> {demande.motif}</p>
            <p><strong>Date de rejet:</strong> {new Date(demande.dateRejet).toLocaleDateString("fr-FR")}</p>
            <button className="restore-btn" onClick={() => restaurerDemande(index)}>
              <i className="fas fa-undo"></i> Restaurer
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Historique;