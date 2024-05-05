// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Election {
    struct Vote {
        string ballot;
        bool deleted;
        bool granted;
    }

    mapping(address => Vote) public votes_;
    address[] public votes_address_;
    address[] public deleted_votes_address_;
    uint64 candidates_count_;
    string id_;
    address owner_;
    bool ended_ = false;

    modifier _ownerOnly() {
        require(msg.sender == owner_, "Only the owner can execute this method");
        _;
    }

    modifier _notEndend() {
        require(ended_ == false, "Election has ended");
        _;
    }

    constructor(uint64 candidates_count, string memory id) {
        owner_ = msg.sender;
        candidates_count_ = candidates_count;
        id_ = id;
    }

    function grant(address addr) external _notEndend _ownerOnly {
        votes_[addr].granted = true;
    }

    function vote(string calldata ballot) external _notEndend returns (uint) {
        // Ya se ha emitido un voto con esta cuenta
        require(abi.encodePacked(votes_[msg.sender].ballot).length <= 0, "This account has already been used to vote");
        // Ya se ha emitido un voto con esta cuenta que ha sido borrado
        require(!votes_[msg.sender].deleted, "This account has been removed");
        // El usuario está autorizado a votar
        require(votes_[msg.sender].granted, "This account hasn't been granted to vote");

        votes_[msg.sender].ballot = ballot;
        votes_address_.push(msg.sender);

        return block.number;
    }

    function revoke(address voter) external _ownerOnly _notEndend returns (uint) {
        bool deleted = false;

        for (uint i = 0; i < votes_address_.length; i++) {
            if (votes_address_[i] == voter) {
                // Eliminar dirección de el array de votos
                votes_address_[i] = votes_address_[votes_address_.length - 1];
                votes_address_.pop();
                
                // Guardar la dirección
                deleted_votes_address_.push(voter);
                votes_[voter].deleted = true;
                
                deleted = true;
                break;
            }
        }

        require(deleted == true, "Vote didn't exist");

        return block.number;
    }

    function tally() external _ownerOnly _notEndend returns (string memory result) {
        string memory acc;
        for (uint i = 0; i < votes_address_.length; i++) {
            string memory ballot = votes_[votes_address_[i]].ballot;

            uint vote_size = bytes(ballot).length;
            uint result_size = bytes(result).length;
            uint total_size = vote_size + result_size;

            assembly { mstore(acc, total_size) }

            // Copiar voto
            for (uint j = 0; j < vote_size; i++) {
                assembly {
                    mstore(add(acc, j), mload(add(ballot, j)))
                }
            }

            // Copiar acc
            for (uint j = 0; j < bytes(result).length; i++) {
                assembly {
                    mstore(add(add(acc, j), vote_size), mload(add(result, j)))
                }
            }

            assembly {
                let input_size := mload(ballot)
                let input := add(ballot, 0x20)

                if iszero(staticcall(not(0), 0x1, ballot, input_size, 0x40, 0x00)) {
                    revert(0, 0)
                }

                let output_size := input_size
                let acc_size := mload(acc)
                input_size := add(input_size, acc_size)


                if iszero(staticcall(not(0), 0x2, acc, input_size, result, output_size)) {
                    revert(0, 0)
                }
            }
        }

        ended_ = true;
    }
}
