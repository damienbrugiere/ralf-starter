# language: fr
Fonctionnalité: Connexion avec Discord ou Google

  Scénario: Un visiteur non connecté est redirigé vers la page de connexion
    Quand j'ouvre la page "/games"
    Alors je suis sur la page de connexion
    Et je vois les boutons de connexion Discord et Google

  Scénario: Connexion puis déconnexion avec un fournisseur simulé
    Soit je suis connecté avec Discord
    Alors je vois mon nom "Aventurier" dans l'en-tête
    Quand je clique sur "Se déconnecter"
    Alors je suis sur la page de connexion
    Et je ne vois pas de nom d'utilisateur dans l'en-tête

  Scénario: Connexion refusée par l'utilisateur chez le fournisseur
    Soit le fournisseur refusera la prochaine connexion
    Quand j'ouvre la page "/login"
    Et je clique sur "Se connecter avec Discord"
    Alors je suis sur la page de connexion
    Et je vois le message de connexion "refusée ou annulée"

  Scénario: L'API refuse les visiteurs non connectés
    Quand un visiteur non connecté appelle "/api/me" via l'API
    Et un visiteur non connecté appelle "/api/games" via l'API
    Alors l'appel à "/api/me" est refusé avec le statut 401
    Et l'appel à "/api/games" est refusé avec le statut 401
