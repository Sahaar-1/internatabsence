import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import "./admin.css";

const AdminDemmande = () => {
  const [demandes, setDemandes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const savedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
    setDemandes(savedDemandes);
  }, []);

  const updateStatus = (index, status) => {
    const updatedDemandes = [...demandes];
    const demandeToUpdate = updatedDemandes[index];

    if (status === "rejected") {
      // Récupérer l'historique existant
      const historique = JSON.parse(localStorage.getItem("historique_reclamations")) || [];
      
      // Ajouter la date de rejet
      demandeToUpdate.dateRejet = new Date().toISOString();
      
      // Ajouter la demande refusée à l'historique
      historique.push(demandeToUpdate);
      
      // Sauvegarder l'historique mis à jour
      localStorage.setItem("historique_reclamations", JSON.stringify(historique));
      
      // Supprimer la demande de la liste actuelle
      updatedDemandes.splice(index, 1);
    } else {
      // Pour les autres statuts, juste mettre à jour le statut
      demandeToUpdate.status = status;
    }

    // Sauvegarder les demandes mises à jour
    localStorage.setItem("demandes", JSON.stringify(updatedDemandes));
    setDemandes(updatedDemandes);
  };

  const filteredDemandes = demandes.filter((demande) => {
    const statusMatch = filterStatus === "all" || demande.status === filterStatus;
    const typeMatch = filterType === "all" || demande.typeReclamation === filterType;
    return statusMatch && typeMatch;
  });

  return (
    <div className="admin-container">
      <h2>Gestion des Demandes</h2>
      <div className="filters">
  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>

    <option value="all">filtrer par status</option>
    <option value="pending">En attente</option>
    <option value="accepted">Acceptée</option>
    <option value="rejected">Rejetée</option>
  </select>

  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
    <option value="all">filtrer par types </option>
    <option value="absence">Absence</option>
    <option value="restauration">Restauration</option>  </select>

    <button className="historique-btn" onClick={() => navigate("/historique")}>
  <i className="fas fa-history"></i> Historique
</button>
  
</div>
      

      {filteredDemandes.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-inbox"></i>
          <p>Aucune demande trouvée</p>
        </div>
      ) : (
        filteredDemandes.map((demande, index) => (
          <div className="demande-card" key={index}>
            <div className="demande-header">
              <div className="demande-info">
                <h3 className="demmande-nom"> {demande.nom}</h3><br></br>
                <div className="contact-info">
                  <span><i className="fas fa-phone" ></i>:     {demande.telephone}</span><br></br>
                  <span><i className="fas fa-door-closed"></i> Chambre :   {demande.chambre}</span>
                </div>
              </div>
              <span className={`status-badge status-${demande.status}`}>
                {demande.status === "accepted" ? "Acceptée" : demande.status === "rejected" ? "Refusée" : "En attente"}
              </span>
            </div>
            <div className="demande-details">
              <p><strong>Type:</strong> {demande.typeReclamation === "absence" ? "Absence" : "Restauration"}</p>
              <p><strong> Periode Du:</strong> {new Date(demande.dateDebut).toLocaleDateString("fr-FR")}</p>
              <p><strong>à:</strong> {new Date(demande.dateFin).toLocaleDateString("fr-FR")}</p>
              {demande.typeReclamation === "restauration" ? (
                <p><strong>Repas concernés:</strong> {
  Array.isArray(demande.repas)
    ? demande.repas.join(", ")
    : (demande.repas ? Object.values(demande.repas).join(", ") : "Aucun repas")
}</p>) : (
  <p><strong>Durée:</strong> {demande.duree}</p>
)}
               
              <p><strong>Motif:</strong> {demande.motif}</p>
            </div>
            {demande.status === "pending" && (
              <div className="demande-actions">
                <button className="action-btn accept" onClick={() => updateStatus(index, "accepted")}>
                  <i className="fas fa-check"></i> Accepter
                </button>
                <button className="action-btn reject" onClick={() => updateStatus(index, "rejected")}>
                  <i className="fas fa-times"></i> Refuser
                </button>
                
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDemmande;
