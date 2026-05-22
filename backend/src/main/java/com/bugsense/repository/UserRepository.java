package com.bugsense.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.bugsense.domain.User;

public interface UserRepository extends MongoRepository<User, String> {
	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);
}
