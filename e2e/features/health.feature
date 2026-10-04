# language: fr
Fonctionnalité: Socle technique

  Scénario: La page d'accueil indique que le serveur est disponible
    Soit je suis connecté avec Discord
    Et je suis sur la page d'accueil
    Alors je vois le titre "Bienvenue"
    Et le statut du serveur est "Serveur disponible"

  Scénario: L'endpoint de santé du backend répond
    Quand j'appelle l'endpoint de santé de l'API
    Alors la réponse a le statut "UP"
