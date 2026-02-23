package com.turmalin.productsapi.reservations.email;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ReservationCreatedEmailListener {

    private final ReservationEmailNotificationService emailNotificationService;

    public ReservationCreatedEmailListener(ReservationEmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReservationCreated(ReservationCreatedEvent event) {
        emailNotificationService.sendReservationConfirmation(event);
    }
}
