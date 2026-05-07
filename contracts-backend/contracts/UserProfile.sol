pragma solidity ^0.8.20;

contract UserProfile {
    struct User {
        string username;
        string email;
        address account;
        bool exists;
    }

    mapping(address => User) private users;

    event UserRegistered(address indexed account, string username);

    function registerUser(string memory _username, string memory _email) public {
        require(!users[msg.sender].exists, "User already registered");
        require(bytes(_username).length > 0, "Username required");
        require(bytes(_email).length > 0, "Email required");

        users[msg.sender] = User({
            username: _username,
            email: _email,
            account: msg.sender,
            exists: true
        });

        emit UserRegistered(msg.sender, _username);
    }

    function getUser(address _account) public view returns (string memory, string memory, address) {
        require(users[_account].exists, "User not found");
        User memory u = users[_account];
        return (u.username, u.email, u.account);
    }

    function isRegistered(address _account) public view returns (bool) {
        return users[_account].exists;
    }
}