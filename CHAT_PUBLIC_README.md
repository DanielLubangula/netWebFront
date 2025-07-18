# Chat Public - Documentation

## Vue d'ensemble

Le chat public est une fonctionnalité complète qui permet aux utilisateurs de discuter en temps réel. Il inclut toutes les fonctionnalités demandées :

- ✅ Messages en temps réel avec Socket.io
- ✅ Photos de profil et noms d'utilisateurs
- ✅ Système de réponses aux messages
- ✅ Menu contextuel avec 3 points verticaux
- ✅ Suppression de messages (seulement par l'auteur)
- ✅ Interface moderne et responsive

## Fonctionnalités

### 1. Envoi de messages
- Saisie de texte avec auto-resize
- Envoi avec Entrée ou bouton
- Limite de 500 caractères
- Indicateur de chargement

### 2. Réponses aux messages
- Clic sur "Répondre" dans le menu contextuel
- Affichage du message original en cours de réponse
- Possibilité d'annuler la réponse

### 3. Menu contextuel (3 points verticaux)
- **Répondre** : Permet de répondre à un message
- **Supprimer** : Seulement visible pour l'auteur du message

### 4. Temps réel
- Messages instantanés via Socket.io
- Suppression en temps réel
- Notifications d'erreur/succès

## Structure des fichiers

### Backend
```
NetWebQuiz_Back/
├── models/PublicMessage.js          # Modèle de données
├── controllers/chatController.js     # Logique métier
├── routes/chat.routes.js           # Routes API
└── socket.js                       # Événements Socket.io
```

### Frontend
```
project/src/
├── pages/chats/PublicChat.tsx      # Composant principal
├── components/ui/
│   ├── MessageBubble.tsx           # Affichage des messages
│   ├── MessageMenu.tsx             # Menu contextuel
│   ├── MessageInput.tsx            # Zone de saisie
│   └── Toast.tsx                   # Notifications
└── services/chatService.ts         # Service API
```

## API Endpoints

### GET /api/chat/public
Récupère les messages publics avec pagination

**Paramètres :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre de messages par page (défaut: 50)

**Réponse :**
```json
{
  "messages": [
    {
      "_id": "message_id",
      "text": "Contenu du message",
      "username": "nom_utilisateur",
      "profilePicture": "url_image",
      "replyTo": {
        "messageId": "id_message_original",
        "username": "nom_utilisateur_original",
        "text": "texte_original"
      },
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalMessages": 250,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/chat/public
Envoie un nouveau message

**Body :**
```json
{
  "text": "Contenu du message",
  "replyTo": {
    "messageId": "id_message_original"
  }
}
```

### DELETE /api/chat/public/:messageId
Supprime un message (seulement par l'auteur)

## Événements Socket.io

### Événements émis par le client
- `joinPublicChat` : Rejoindre le chat public
- `leavePublicChat` : Quitter le chat public
- `newPublicMessage` : Envoyer un nouveau message
- `deletePublicMessage` : Supprimer un message

### Événements reçus par le client
- `publicMessageReceived` : Nouveau message reçu
- `publicMessageDeleted` : Message supprimé
- `publicMessageError` : Erreur lors d'une opération
- `publicMessageSent` : Confirmation d'envoi

## Utilisation

### Accès au chat
1. Connectez-vous à l'application
2. Naviguez vers `/chat/public`
3. Le chat se charge automatiquement

### Envoyer un message
1. Tapez votre message dans la zone de saisie
2. Appuyez sur Entrée ou cliquez sur le bouton d'envoi

### Répondre à un message
1. Cliquez sur les 3 points verticaux à côté d'un message
2. Sélectionnez "Répondre"
3. Le message original s'affiche en cours de réponse
4. Tapez votre réponse et envoyez

### Supprimer un message
1. Cliquez sur les 3 points verticaux à côté de votre message
2. Sélectionnez "Supprimer"
3. Le message est supprimé instantanément

## Sécurité

- Authentification requise pour toutes les opérations
- Seul l'auteur peut supprimer ses messages
- Validation des données côté serveur
- Protection contre les injections

## Performance

- Pagination des messages
- Indexation de la base de données
- Optimisation des requêtes
- Gestion efficace des connexions Socket.io

## Maintenance

Le chat public est conçu pour être facilement maintenable et extensible. Tous les composants sont modulaires et peuvent être modifiés indépendamment. 