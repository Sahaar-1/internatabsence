import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Configuration du localizer avec moment
const localizer = momentLocalizer(moment);

// Configuration des messages en français
const messages = {
  next: "Suivant",
  previous: "Précédent",
  today: "Aujourd'hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
};

const Calendaar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const savedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
    const acceptedEvents = savedDemandes
      .filter(
        (demande) =>
          demande.status === "accepted" &&
          (demande.typeReclamation === "absence" || demande.typeReclamation === "restauration")
      )
      .map((demande) => ({
        title: `${demande.nom} - ${demande.typeReclamation === "absence" ? "Absence" : "Restauration"}`,
        start: new Date(demande.dateDebut),
        end: new Date(demande.dateFin),
        allDay: true,
        resource: demande,
      }));
    setEvents(acceptedEvents);
  }, []);

  // Fonction pour filtrer les événements en fonction de la vue et de la date
  const filterEventsByView = useCallback((currentView, currentDate) => {
    const startOfPeriod = moment(currentDate).startOf(
      currentView === Views.MONTH ? 'month' :
      currentView === Views.WEEK ? 'week' :
      'day'
    );
    
    const endOfPeriod = moment(currentDate).endOf(
      currentView === Views.MONTH ? 'month' :
      currentView === Views.WEEK ? 'week' :
      'day'
    );

    return events.filter(event => {
      const eventStart = moment(event.start);
      const eventEnd = moment(event.end);
      
      return (
        (eventStart.isSameOrAfter(startOfPeriod) && eventStart.isSameOrBefore(endOfPeriod)) ||
        (eventEnd.isSameOrAfter(startOfPeriod) && eventEnd.isSameOrBefore(endOfPeriod)) ||
        (eventStart.isBefore(startOfPeriod) && eventEnd.isAfter(endOfPeriod))
      );
    });
  }, [events]);

  // Mettre à jour les événements filtrés quand la vue ou la date change
  useEffect(() => {
    const filtered = filterEventsByView(view, date);
    setFilteredEvents(filtered);
  }, [view, date, filterEventsByView]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setEditedEvent({ ...event.resource });
    setIsEditing(false);
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.resource.typeReclamation === "absence" ? "#00bcd4" : "#f1c40f",
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return { style };
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleView = (newView) => {
    setView(newView);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      const savedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
      const updatedDemandes = savedDemandes.filter(
        (demande) =>
          demande.nom !== selectedEvent.nom ||
          demande.dateDebut !== selectedEvent.dateDebut ||
          demande.typeReclamation !== selectedEvent.typeReclamation
      );
      localStorage.setItem("demandes", JSON.stringify(updatedDemandes));
      const updatedEvents = events.filter(
        (event) =>
          event.resource.nom !== selectedEvent.nom ||
          event.resource.dateDebut !== selectedEvent.dateDebut ||
          event.resource.typeReclamation !== selectedEvent.typeReclamation
      );
      setEvents(updatedEvents);
      setSelectedEvent(null);
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({ ...prev, [name]: value }));
  };

  // Sauvegarde des modifications
  const handleSaveEdit = () => {
    const savedDemandes = JSON.parse(localStorage.getItem("demandes")) || [];
    const updatedDemandes = savedDemandes.map((demande) =>
      demande.nom === selectedEvent.nom &&
      demande.dateDebut === selectedEvent.dateDebut &&
      demande.typeReclamation === selectedEvent.typeReclamation
        ? { ...demande, ...editedEvent }
        : demande
    );
    localStorage.setItem("demandes", JSON.stringify(updatedDemandes));
    
    // Mettre à jour les événements affichés
    const updatedEvents = events.map((event) =>
      event.resource.nom === selectedEvent.nom &&
      event.resource.dateDebut === selectedEvent.dateDebut &&
      event.resource.typeReclamation === selectedEvent.typeReclamation
        ? {
            ...event,
            title: `${editedEvent.nom} - ${editedEvent.typeReclamation === "absence" ? "Absence" : "Restauration"}`,
            start: new Date(editedEvent.dateDebut),
            end: new Date(editedEvent.dateFin),
            resource: editedEvent,
          }
        : event
    );
    setEvents(updatedEvents);
    setSelectedEvent(editedEvent);
    setIsEditing(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrer les événements par recherche et par vue
  const searchedEvents = filteredEvents.filter((event) =>
    event.resource.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Titre du document avec la période
    doc.setFontSize(16);
    let periodText = '';
    if (view === Views.MONTH) {
      periodText = `Liste des absences - Mois de ${moment(date).format('MMMM YYYY')}`;
    } else if (view === Views.WEEK) {
      const startOfWeek = moment(date).startOf('week');
      const endOfWeek = moment(date).endOf('week');
      periodText = `Liste des absences - Semaine du ${startOfWeek.format('DD MMMM')} au ${endOfWeek.format('DD MMMM YYYY')}`;
    } else if (view === Views.DAY) {
      periodText = `Liste des absences - ${moment(date).format('DD MMMM YYYY')}`;
    }
    doc.text(periodText, 14, 15);
    
    // Préparation des données pour le tableau
    const tableData = searchedEvents.map(event => [
      event.resource.nom,
      event.resource.typeReclamation === "absence" ? "Absence" : "Restauration",
      moment(event.start).format('DD/MM/YYYY'),
      moment(event.end).format('DD/MM/YYYY'),
      event.resource.chambre,
      event.resource.motif
    ]);

    // Création du tableau
    autoTable(doc, {
      head: [['Nom', 'Type', 'Date Début', 'Date Fin', 'Chambre', 'Motif']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Sauvegarde du PDF
    doc.save(`absences_${moment(date).format('YYYY-MM-DD')}.pdf`);
  };

  return (
    <div className={`calendar-container ${selectedEvent ? "blur-active" : ""}`}>
      <div className="calendar-header">
        <h2>Calendrier des Absences et Restaurations Acceptées</h2>
      </div>

      <div className="calendar-controls">
        <div className="search-export-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <button className="export-btn" onClick={exportToPDF}>
            <i className="fas fa-file-pdf"></i> Exporter en PDF
          </button>
        </div>
      </div>

      <div style={{ height: "600px" }}>
        <Calendar
          localizer={localizer}
          events={searchedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ margin: "20px" }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          messages={messages}
          view={view}
          onView={handleView}
          date={date}
          onNavigate={handleNavigate}
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          culture="fr"
        />
      </div>

      {selectedEvent && <div className="calendar-overlay"></div>}

      {selectedEvent && (
        <div className="event-details">
          <h3>
            <span className={`event-icon ${selectedEvent.typeReclamation}`}>
              {selectedEvent.typeReclamation === "absence" ? "🚪" : "🍽️"}
            </span>{" "}
            {isEditing ? "Modifier" : "Détails de"}{" "}
            {selectedEvent.typeReclamation === "absence" ? "l'absence" : "la restauration"}
          </h3>

          {isEditing ? (
            <div className="edit-form">
              <div>
                <label>Nom:</label>
                <input
                  type="text"
                  name="nom"
                  value={editedEvent.nom}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Téléphone:</label>
                <input
                  type="text"
                  name="telephone"
                  value={editedEvent.telephone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Chambre:</label>
                <input
                  type="text"
                  name="chambre"
                  value={editedEvent.chambre}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Début:</label>
                <input
                  type="date"
                  name="dateDebut"
                  value={moment(editedEvent.dateDebut).format("YYYY-MM-DD")}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Fin:</label>
                <input
                  type="date"
                  name="dateFin"
                  value={moment(editedEvent.dateFin).format("YYYY-MM-DD")}
                  onChange={handleInputChange}
                />
              </div>
              {selectedEvent.typeReclamation === "absence" ? (
                <div>
                  <label>Durée:</label>
                  <input
                    type="text"
                    name="duree"
                    value={editedEvent.duree}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div>
                  <label>Repas:</label>
                  <input
                    type="text"
                    name="repas"
                    value={Array.isArray(editedEvent.repas) ? editedEvent.repas.join(", ") : editedEvent.repas}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div>
                <label>Motif:</label>
                <textarea
                  name="motif"
                  value={editedEvent.motif}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          ) : (
            <>
              <p><strong>Nom:</strong> {selectedEvent.nom}</p>
              <p><strong>Téléphone:</strong> {selectedEvent.telephone}</p>
              <p><strong>Chambre:</strong> {selectedEvent.chambre}</p>
              <p><strong>Début:</strong> {new Date(selectedEvent.dateDebut).toLocaleDateString("fr-FR")}</p>
              <p><strong>Fin:</strong> {new Date(selectedEvent.dateFin).toLocaleDateString("fr-FR")}</p>
              {selectedEvent.typeReclamation === "absence" ? (
                <p><strong>Durée:</strong> {selectedEvent.duree}</p>
              ) : (
                <p><strong>Repas concernés:</strong> {Array.isArray(selectedEvent.repas) ? selectedEvent.repas.join(", ") : selectedEvent.repas}</p>
              )}
              <p><strong>Motif:</strong> {selectedEvent.motif}</p>
            </>
          )}

          <div className="event-actions">
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSaveEdit}>
                  Sauvegarder
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Modifier
                </button>
                <button className="delete-btn" onClick={handleDeleteEvent}>
                  Supprimer
                </button>
                <button className="close-btn" onClick={() => setSelectedEvent(null)}>
                  Fermer
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendaar;