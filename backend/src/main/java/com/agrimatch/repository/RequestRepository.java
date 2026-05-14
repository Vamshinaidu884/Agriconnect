package com.agrimatch.repository;

import com.agrimatch.model.Request;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RequestRepository extends MongoRepository<Request, String> {
    List<Request> findByFarmerIdOrderByCreatedAtDesc(String farmerId);
    List<Request> findByStatusOrderByCreatedAtDesc(String status);
    List<Request> findByStateAndStatusOrderByCreatedAtDesc(String state, String status);
    List<Request> findByAcceptedUsersContaining(String userId);
}
