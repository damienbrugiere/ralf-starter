# language: fr
Fonctionnalité: Thème de l'interface

  Scénario: Le thème sombre est appliqué par défaut
    Soit le système préfère le thème sombre
    Quand j'ouvre la page "/login"
    Alors le thème actif est "dark"

  Scénario: Basculer le thème le mémorise
    Soit le système préfère le thème sombre
    Quand j'ouvre la page "/login"
    Et je bascule le thème
    Alors le thème actif est "light"
    Quand j'ouvre la page "/login"
    Alors le thème actif est "light"
