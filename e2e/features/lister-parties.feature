# language: fr
Fonctionnalité: Lister les parties

  Scénario: Une partie créée apparaît dans la liste
    Soit une partie "Le Donjon oublié" existe via l'API
    Quand j'ouvre la liste des parties
    Alors je vois la partie "Le Donjon oublié" dans la liste

  Scénario: L'API renvoie la liste des parties
    Quand je demande la liste des parties via l'API
    Alors l'API renvoie une liste
