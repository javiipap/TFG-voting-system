// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Election {
    mapping(address => string) public votes_;
    mapping(address => bool) public deleted_votes_;
    address[] public votes_address_;
    uint64 candidates_count_;
    string id_;
    address owner_;
    bool ended_ = false;

    modifier _ownerOnly() {
        require(msg.sender == owner_);
        _;
    }

    modifier _notEndend() {
        require(ended_ == false);
        _;
    }

    constructor(uint64 candidates_count, string memory id) {
        owner_ = msg.sender;
        candidates_count_ = candidates_count;
        id_ = id;
    }

    function vote(string calldata ballot) external _notEndend returns (uint) {
        require(!deleted_votes_[msg.sender]);
        votes_[msg.sender] = ballot;
        votes_address_.push(msg.sender);

        return block.number;
    }

    function revoke(address voter) external _ownerOnly _notEndend returns (uint) {
        require(msg.sender == owner_);
        bool deleted = false;

        for (uint i = 0; i < votes_address_.length; i++) {
            if (votes_address_[i] == voter) {
                votes_address_[i] = votes_address_[votes_address_.length - 1];
                votes_address_.pop();
                delete votes_[voter];
                deleted = true;
                break;
            }
        }

        require(deleted == true);
        deleted_votes_[voter] = true;

        return block.number;
    }

    function tally() external _ownerOnly _notEndend returns (string memory result) {
        string memory acc;
        for (uint i = 0; i < votes_address_.length; i++) {
            string memory ballot = votes_[votes_address_[i]];

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
                input := mload(0x40)


                if iszero(staticcall(not(0), 0x2, input, input_size, result, output_size)) {
                    revert(0, 0)
                }
            }
        }

        ended_ = true;
    }
}
