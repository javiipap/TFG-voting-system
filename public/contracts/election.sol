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
    uint256 candidates_count_;
    string public id_;
    address owner_;
    bool public ended_ = false;
    bytes public result_;
    string public public_key_;

    modifier _ownerOnly() {
        require(msg.sender == owner_, "Only the owner can execute this method");
        _;
    }

    modifier _notEndend() {
        require(ended_ == false, "Election has ended");
        _;
    }

    constructor(uint64 candidates_count, string memory id, string memory public_key) {
        owner_ = msg.sender;
        candidates_count_ = candidates_count;
        id_ = id;
        public_key_ = public_key;
    }

    function grant(address addr) external _notEndend _ownerOnly {
        votes_[addr].granted = true;
    }

    function vote(string calldata ballot) external _notEndend {
        // Ya se ha emitido un voto con esta cuenta
        require(abi.encodePacked(votes_[msg.sender].ballot).length <= 0, "This account has already been used to vote");
        // Ya se ha emitido un voto con esta cuenta que ha sido borrado
        require(!votes_[msg.sender].deleted, "This account has been removed");
        // El usuario está autorizado a votar
        require(votes_[msg.sender].granted, "This account hasn't been granted to vote");

        votes_[msg.sender].ballot = ballot;
        votes_address_.push(msg.sender);
    }

    function revoke(address voter) external _ownerOnly _notEndend {
        deleted_votes_address_.push(voter);
        votes_[voter].deleted = true;
 
        for (uint i = 0; i < votes_address_.length; i++) {
            if (votes_address_[i] == voter) {
                // Eliminar dirección de el array de votos
                votes_address_[i] = votes_address_[votes_address_.length - 1];
                votes_address_.pop();

                break;
            }
        }
    }

    function tally() external _ownerOnly _notEndend returns (string memory) {
        uint256 result_size = (129 * candidates_count_) + 1;
        bytes memory result = new bytes(result_size);

        uint256 ballot_size = bytes(votes_[votes_address_[0]].ballot).length;
        
        bytes memory sum_input = new bytes(ballot_size + result_size + 64);
        uint256 sum_input_size = sum_input.length + 32;

        bytes memory public_key = bytes(public_key_);
        uint256 public_key_size = public_key.length + 32;
 
        bytes memory verify_input = new bytes(public_key_size + ballot_size + 64);
        uint256 verify_input_size = verify_input.length + 32;

        uint256 candidates_count = candidates_count_;

        // Crear input pk + n_candidatos + voto
        for (uint j = 32; j < public_key_size + 32; j += 32) {
            assembly {
                mstore(add(verify_input, j), mload(add(public_key, sub(j, 32))))
            }
        }

        assembly {
            mstore(add(verify_input, add(public_key_size, 32)), candidates_count)
        }

        for (uint i = 0; i < votes_address_.length; i++) {
            string memory ballot = votes_[votes_address_[i]].ballot;

            // Añadir voto a verify_input
            for (uint j = public_key_size + 64; j < public_key_size + ballot_size + 96; j += 32) {
                assembly {
                    mstore(add(verify_input, j), mload(add(ballot, sub(j, add(public_key_size, 64)))))
                }
            }

            // Crear sum_input voto + result
            for (uint j = 32; j < ballot_size + 64; j += 32) {
                assembly {
                    mstore(add(sum_input, j), mload(add(ballot, sub(j, 32))))
                }
            }
            for (uint j = 64 + ballot_size; j < result_size + ballot_size + 96; j += 32) {
                assembly {
                    mstore(add(sum_input, j), mload(add(result, sub(j, add(64, ballot_size)))))
                }
            }

            uint[1] memory verified;

            assembly {
                if iszero(staticcall(not(0), 0xc, verify_input, verify_input_size, verified, 32)) {
                    revert(0, 0)
                }

                if eq(mload(verified), 1) {
                    if iszero(staticcall(not(0), 0xb, sum_input, sum_input_size, add(result, 32), result_size)) {
                        revert(0, 0)
                    }
                }
            }
        }

        // ended_ = true;
        result_ = result;
        return string(result);
    }
}
