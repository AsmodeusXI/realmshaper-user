Feature: User Login
    As a Realmshaper User
    I want to be able to log in and out of Realmshaper
    So that I can securely access my related Realmshaper objects

    Scenario: Logging in returns a token
        When I log in as "User"
        Then I receive a token
