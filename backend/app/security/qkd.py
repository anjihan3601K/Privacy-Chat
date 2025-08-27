"""
Quantum Key Distribution (QKD) simulator using BB84 protocol
This module simulates the BB84 quantum key distribution protocol
for generating secure symmetric keys between two parties.
"""

import random
import numpy as np
from typing import List, Tuple, Optional
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import random_statevector
import hashlib


class BB84Simulator:
    """
    BB84 Quantum Key Distribution Protocol Simulator

    This class simulates the BB84 protocol between Alice and Bob,
    with optional eavesdropping detection capabilities.
    """

    def __init__(self, key_length: int = 32):
        """
        Initialize the BB84 simulator

        Args:
            key_length: Desired length of the final symmetric key in bits
        """
        self.key_length = key_length
        self.simulator = AerSimulator()
        self.alice_bits = []
        self.alice_bases = []
        self.bob_bases = []
        self.bob_results = []
        self.shared_key = ""
        self.eavesdropper_detected = False

    def generate_random_bits(self, n: int) -> List[int]:
        """Generate n random bits"""
        return [random.randint(0, 1) for _ in range(n)]

    def generate_random_bases(self, n: int) -> List[int]:
        """Generate n random bases (0 for Z basis, 1 for X basis)"""
        return [random.randint(0, 1) for _ in range(n)]

    def alice_prepare_qubits(
        self, bits: List[int], bases: List[int]
    ) -> List[QuantumCircuit]:
        """
        Alice prepares qubits based on her bits and chosen bases

        Args:
            bits: List of bits to encode
            bases: List of bases to use (0=Z, 1=X)

        Returns:
            List of quantum circuits representing prepared qubits
        """
        circuits = []

        for bit, base in zip(bits, bases):
            qc = QuantumCircuit(1, 1)

            # Prepare the qubit based on bit value and basis
            if bit == 1:
                qc.x(0)  # Flip to |1⟩ if bit is 1

            if base == 1:  # X basis
                qc.h(0)  # Apply Hadamard for X basis

            circuits.append(qc)

        return circuits

    def eve_intercept(
        self, circuits: List[QuantumCircuit], interception_rate: float = 0.5
    ) -> List[QuantumCircuit]:
        """
        Simulate Eve's interception attempt

        Args:
            circuits: Original quantum circuits from Alice
            interception_rate: Probability of Eve intercepting each qubit

        Returns:
            Modified circuits after potential interception
        """
        intercepted_circuits = []

        for qc in circuits:
            if random.random() < interception_rate:
                # Eve intercepts and measures in random basis
                eve_basis = random.randint(0, 1)

                # Create new circuit for Eve's measurement
                eve_qc = qc.copy()
                if eve_basis == 1:  # X basis
                    eve_qc.h(0)
                eve_qc.measure(0, 0)

                # Execute Eve's measurement
                job = self.simulator.run(transpile(eve_qc, self.simulator), shots=1)
                result = job.result()
                eve_measurement = int(list(result.get_counts().keys())[0])

                # Eve prepares new qubit based on her measurement
                new_qc = QuantumCircuit(1, 1)
                if eve_measurement == 1:
                    new_qc.x(0)
                if eve_basis == 1:
                    new_qc.h(0)

                intercepted_circuits.append(new_qc)
            else:
                intercepted_circuits.append(qc)

        return intercepted_circuits

    def bob_measure_qubits(
        self, circuits: List[QuantumCircuit], bases: List[int]
    ) -> List[int]:
        """
        Bob measures the received qubits using his chosen bases

        Args:
            circuits: Quantum circuits received from Alice (possibly through Eve)
            bases: Bob's chosen measurement bases

        Returns:
            List of measurement results
        """
        results = []

        for qc, base in zip(circuits, bases):
            # Create measurement circuit
            measure_qc = qc.copy()

            if base == 1:  # X basis measurement
                measure_qc.h(0)

            measure_qc.measure(0, 0)

            # Execute measurement
            job = self.simulator.run(transpile(measure_qc, self.simulator), shots=1)
            result = job.result()
            measurement = int(list(result.get_counts().keys())[0])
            results.append(measurement)

        return results

    def sift_key(
        self,
        alice_bits: List[int],
        alice_bases: List[int],
        bob_bases: List[int],
        bob_results: List[int],
    ) -> Tuple[List[int], List[int]]:
        """
        Sift the raw key by keeping only bits where Alice and Bob used same basis

        Returns:
            Tuple of (alice_sifted_bits, bob_sifted_bits)
        """
        alice_sifted = []
        bob_sifted = []

        for a_bit, a_base, b_base, b_result in zip(
            alice_bits, alice_bases, bob_bases, bob_results
        ):
            if a_base == b_base:  # Same basis used
                alice_sifted.append(a_bit)
                bob_sifted.append(b_result)

        return alice_sifted, bob_sifted

    def detect_eavesdropping(
        self, alice_sifted: List[int], bob_sifted: List[int], test_fraction: float = 0.1
    ) -> bool:
        """
        Detect eavesdropping by comparing a subset of the sifted key

        Args:
            alice_sifted: Alice's sifted bits
            bob_sifted: Bob's sifted bits
            test_fraction: Fraction of bits to use for eavesdropping detection

        Returns:
            True if eavesdropping detected, False otherwise
        """
        if len(alice_sifted) != len(bob_sifted):
            return True

        n_test = max(1, int(len(alice_sifted) * test_fraction))
        test_indices = random.sample(
            range(len(alice_sifted)), min(n_test, len(alice_sifted))
        )

        errors = 0
        for i in test_indices:
            if alice_sifted[i] != bob_sifted[i]:
                errors += 1

        # Remove test bits from the key
        alice_final = [
            bit for i, bit in enumerate(alice_sifted) if i not in test_indices
        ]
        bob_final = [bit for i, bit in enumerate(bob_sifted) if i not in test_indices]

        # Calculate error rate
        error_rate = errors / len(test_indices) if test_indices else 0

        # Threshold for eavesdropping detection (typically 11% for BB84)
        eavesdropping_threshold = 0.11

        if error_rate > eavesdropping_threshold:
            return True

        # Update sifted keys after removing test bits
        alice_sifted.clear()
        alice_sifted.extend(alice_final)
        bob_sifted.clear()
        bob_sifted.extend(bob_final)

        return False

    def privacy_amplification(self, bits: List[int]) -> str:
        """
        Perform privacy amplification using hash function

        Args:
            bits: Raw sifted bits

        Returns:
            Final symmetric key as hex string
        """
        # Convert bits to bytes
        bit_string = "".join(map(str, bits))

        # Pad to ensure we have enough bits
        while len(bit_string) < self.key_length:
            bit_string += bit_string

        # Take only required length
        bit_string = bit_string[: self.key_length]

        # Convert to bytes and hash
        byte_data = int(bit_string, 2).to_bytes((len(bit_string) + 7) // 8, "big")
        hash_obj = hashlib.sha256(byte_data)

        # Return first 32 bytes (256 bits) as hex
        return hash_obj.hexdigest()

    def run_protocol(
        self, with_eavesdropper: bool = False, eavesdropper_rate: float = 0.5
    ) -> Tuple[str, bool]:
        """
        Run the complete BB84 protocol

        Args:
            with_eavesdropper: Whether to simulate eavesdropping
            eavesdropper_rate: Rate of eavesdropping if enabled

        Returns:
            Tuple of (symmetric_key_hex, eavesdropper_detected)
        """
        # Generate more bits than needed to account for sifting
        n_bits = self.key_length * 4

        # Step 1: Alice generates random bits and bases
        self.alice_bits = self.generate_random_bits(n_bits)
        self.alice_bases = self.generate_random_bases(n_bits)

        # Step 2: Alice prepares qubits
        alice_circuits = self.alice_prepare_qubits(self.alice_bits, self.alice_bases)

        # Step 3: Optional eavesdropping
        if with_eavesdropper:
            alice_circuits = self.eve_intercept(alice_circuits, eavesdropper_rate)

        # Step 4: Bob chooses random bases and measures
        self.bob_bases = self.generate_random_bases(n_bits)
        self.bob_results = self.bob_measure_qubits(alice_circuits, self.bob_bases)

        # Step 5: Public discussion - sift the key
        alice_sifted, bob_sifted = self.sift_key(
            self.alice_bits, self.alice_bases, self.bob_bases, self.bob_results
        )

        # Step 6: Eavesdropping detection
        self.eavesdropper_detected = self.detect_eavesdropping(alice_sifted, bob_sifted)

        if self.eavesdropper_detected:
            return "", True

        # Step 7: Privacy amplification
        if len(alice_sifted) < self.key_length // 4:
            # Not enough bits for secure key
            return "", True

        self.shared_key = self.privacy_amplification(alice_sifted)

        return self.shared_key, False


def generate_session_key(
    user1_id: str, user2_id: str, simulate_eavesdropper: bool = False
) -> Tuple[Optional[str], bool]:
    """
    Generate a session key using BB84 QKD protocol

    Args:
        user1_id: ID of first user
        user2_id: ID of second user
        simulate_eavesdropper: Whether to simulate an eavesdropping attempt

    Returns:
        Tuple of (session_key_hex or None, eavesdropper_detected)
    """
    try:
        bb84 = BB84Simulator(key_length=32)
        key, eavesdropper_detected = bb84.run_protocol(
            with_eavesdropper=simulate_eavesdropper,
            eavesdropper_rate=0.3,  # 30% interception rate
        )

        if eavesdropper_detected or not key:
            return None, True

        return key, False

    except Exception as e:
        print(f"QKD error: {e}")
        return None, True


if __name__ == "__main__":
    # Test the BB84 protocol
    print("Testing BB84 Protocol...")

    # Test without eavesdropper
    print("\n1. Testing without eavesdropper:")
    key, eve_detected = generate_session_key("alice", "bob", False)
    print(f"Key generated: {key is not None}")
    print(f"Eavesdropper detected: {eve_detected}")
    if key:
        print(f"Session key: {key[:32]}...")

    # Test with eavesdropper
    print("\n2. Testing with eavesdropper:")
    key, eve_detected = generate_session_key("alice", "bob", True)
    print(f"Key generated: {key is not None}")
    print(f"Eavesdropper detected: {eve_detected}")
