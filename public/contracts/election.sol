// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Election {
    struct Vote {
        bytes ballot;
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
    bytes public public_key_;
    bytes public rsa_public_key_;

    modifier _ownerOnly() {
        require(msg.sender == owner_, "Only the owner can execute this method");
        _;
    }

    modifier _notEndend() {
        require(ended_ == false, "Election has ended");
        _;
    }

    function addressToString(address _addr) public pure returns (string memory) {
        bytes memory data = abi.encodePacked(_addr);
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';

        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }

        return string(str);
    }

    constructor(uint256 candidates_count, string memory id, bytes memory public_key, bytes memory rsa_public_key) {
        owner_ = msg.sender;
        candidates_count_ = candidates_count;
        id_ = id;
        public_key_ = public_key;
        rsa_public_key_ = rsa_public_key;

        bytes memory generator_input = abi.encode(candidates_count);
        uint256 generator_input_size = generator_input.length;

        uint256 result_size = 80 * candidates_count_ + 8;
        bytes memory result = new bytes(result_size);

        assembly {
            if iszero(staticcall(not(0), 0x12, add(generator_input, 0x20), generator_input_size, add(result, 0x20), result_size)) {
                revert(0, 0)
            }
        }

        result_ = result;
    }

    function grant(address addr) external _notEndend _ownerOnly {
        votes_[addr].granted = true;
    }

    function vote(bytes calldata ballot , uint256 iat, bytes calldata signature) external _notEndend {
        // Ya se ha emitido un voto con esta cuenta
        require(abi.encodePacked(votes_[msg.sender].ballot).length <= 0, "This account has already been used to vote");
        // Ya se ha emitido un voto con esta cuenta que ha sido borrado
        require(!votes_[msg.sender].deleted, "This account has been removed");
        // Ha pasado el suficiente tiempo para votar
        require(block.timestamp >= iat, "The account hasn't reached the necesary delay since creation");

        bytes memory ticket = abi.encode(addressToString(msg.sender), id_, iat);
        bytes memory verify_sig_props = abi.encode(rsa_public_key_, ticket, signature);
        uint256 verify_sig_props_len = verify_sig_props.length;
        uint[1] memory verified;

        assembly {
            if iszero(staticcall(not(0), 0x15, add(verify_sig_props, 0x20), verify_sig_props_len, verified, 0x20)) {
                revert(0, 0)
            }
        }

        require(verified[0] == 1, "Invalid server signature");
        
        bytes memory verify_ballot_props = abi.encode(candidates_count_, public_key_, ballot);
        uint256 verify_ballot_props_len = verify_ballot_props.length;

        assembly {
            if iszero(staticcall(not(0), 0x14, add(verify_ballot_props, 0x20), verify_ballot_props_len, verified, 0x20)) {
                revert(0, 0)
            }
        }

        require(verified[0] == 1, "Invalid ballot");

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
        bytes memory result = result_;
        uint256 result_len = result.length;

        for (uint i = 0; i < votes_address_.length; i++) {
            bytes memory add_props = abi.encode(result, votes_[votes_address_[i]].ballot);
            uint256 add_props_len = add_props.length;

            assembly {
                if iszero(staticcall(not(0), 0x13, add(add_props, 0x20), add_props_len, add(result, 0x20), result_len)) {
                    revert(0, 0)
                }
            }
        }

        result_ = result;

        return string(result);
    }
}
