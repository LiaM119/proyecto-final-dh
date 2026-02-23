package com.turmalin.productsapi.reservations.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class ReservationEmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationEmailNotificationService.class);
    private static final Locale SPANISH = Locale.forLanguageTag("es-AR");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy", SPANISH);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", SPANISH);

    private final JavaMailSender mailSender;
    private final ReservationEmailProperties emailProperties;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.properties.mail.smtp.auth:true}")
    private boolean smtpAuth;

    public ReservationEmailNotificationService(
            JavaMailSender mailSender,
            ReservationEmailProperties emailProperties
    ) {
        this.mailSender = mailSender;
        this.emailProperties = emailProperties;
    }

    @PostConstruct
    void logMailConfigStatus() {
        log.info(
                "Mail config -> host: {}, username: {}, auth: {}, passwordConfigured: {}",
                StringUtils.hasText(mailHost) ? mailHost : "(vacio)",
                StringUtils.hasText(mailUsername) ? mailUsername : "(vacio)",
                smtpAuth,
                StringUtils.hasText(mailPassword)
        );
    }

    public void sendReservationConfirmation(ReservationCreatedEvent event) {
        if (event == null || !StringUtils.hasText(event.recipientEmail())) {
            return;
        }
        log.info(
                "Procesando envio de confirmacion para reserva {} al destinatario {}",
                event.reservationId(),
                event.recipientEmail()
        );
        if (!emailProperties.isEnabled()) {
            log.info("Email de confirmacion de reserva deshabilitado por configuracion");
            return;
        }
        if (!StringUtils.hasText(mailHost)) {
            log.warn(
                    "No se envio email de confirmacion para reserva {} (destinatario {}): spring.mail.host vacio",
                    event.reservationId(),
                    event.recipientEmail()
            );
            return;
        }
        if (smtpAuth && (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(mailPassword))) {
            log.warn(
                    "No se envio email de confirmacion para reserva {} (destinatario {}): faltan credenciales SMTP (username/password)",
                    event.reservationId(),
                    event.recipientEmail()
            );
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    true,
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(event.recipientEmail());
            helper.setFrom(resolveFromAddress());
            helper.setSubject(buildSubject(event));
            helper.setText(buildPlainText(event), buildHtml(event));

            mailSender.send(message);
            log.info("Email de confirmacion enviado para reserva {} a {}", event.reservationId(), event.recipientEmail());
        } catch (Exception ex) {
            log.error("Error enviando email de confirmacion para reserva {}", event.reservationId(), ex);
        }
    }

    private String resolveFromAddress() {
        if (StringUtils.hasText(emailProperties.getFrom())) {
            return emailProperties.getFrom();
        }
        if (StringUtils.hasText(mailUsername)) {
            return mailUsername;
        }
        return "no-reply@turmalin.local";
    }

    private String buildSubject(ReservationCreatedEvent event) {
        String product = safeValue(event.productName(), "tu reserva");
        return "Confirmacion de reserva #" + event.reservationId() + " - " + product;
    }

    private String buildPlainText(ReservationCreatedEvent event) {
        String reservedAt = formatDateTime(event.reservedAt());
        String start = formatDate(event.startDate() != null ? event.startDate().atStartOfDay() : null);
        String end = formatDate(event.endDate() != null ? event.endDate().atStartOfDay() : null);

        return """
                Hola %s,

                Confirmamos tu reserva.

                Detalle:
                - Codigo de reserva: #%s
                - Alojamiento: %s
                - Fecha de inicio: %s
                - Fecha de fin: %s
                - Confirmada el: %s

                Contacto del proveedor:
                - Nombre: %s
                - Email: %s
                - Telefono: %s

                Gracias por elegirnos.
                """.formatted(
                safeValue(event.recipientName(), "usuario"),
                safeValue(event.reservationId(), "-"),
                safeValue(event.productName(), "-"),
                start,
                end,
                reservedAt,
                safeValue(emailProperties.getProviderContactName(), "-"),
                safeValue(emailProperties.getProviderContactEmail(), "-"),
                safeValue(emailProperties.getProviderContactPhone(), "-")
        );
    }

    private String buildHtml(ReservationCreatedEvent event) {
        String reservedAt = formatDateTime(event.reservedAt());
        String start = formatDate(event.startDate() != null ? event.startDate().atStartOfDay() : null);
        String end = formatDate(event.endDate() != null ? event.endDate().atStartOfDay() : null);

        return """
                <html>
                  <body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%%" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;">
                            <tr>
                              <td style="padding:24px;">
                                <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">Confirmacion de reserva</h1>
                                <p style="margin:0 0 16px;font-size:16px;">Hola <strong>%s</strong>, tu reserva fue confirmada correctamente.</p>

                                <h2 style="margin:24px 0 12px;font-size:18px;color:#111827;">Detalle de la reserva</h2>
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                  <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;"><strong>Codigo</strong></td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">#%s</td></tr>
                                  <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;"><strong>Alojamiento</strong></td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">%s</td></tr>
                                  <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;"><strong>Fecha de inicio</strong></td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">%s</td></tr>
                                  <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;"><strong>Fecha de fin</strong></td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">%s</td></tr>
                                  <tr><td style="padding:8px 0;"><strong>Confirmada el</strong></td><td style="padding:8px 0;">%s</td></tr>
                                </table>

                                <h2 style="margin:24px 0 12px;font-size:18px;color:#111827;">Contacto del proveedor</h2>
                                <p style="margin:0 0 8px;"><strong>Nombre:</strong> %s</p>
                                <p style="margin:0 0 8px;"><strong>Email:</strong> %s</p>
                                <p style="margin:0;"><strong>Telefono:</strong> %s</p>

                                <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">Este correo se envio automaticamente luego de registrar la reserva.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(
                safeValue(event.recipientName(), "usuario"),
                safeValue(event.reservationId(), "-"),
                safeValue(event.productName(), "-"),
                start,
                end,
                reservedAt,
                safeValue(emailProperties.getProviderContactName(), "-"),
                safeValue(emailProperties.getProviderContactEmail(), "-"),
                safeValue(emailProperties.getProviderContactPhone(), "-")
        );
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "-";
        return DATE_TIME_FORMATTER.format(dateTime);
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "-";
        return DATE_FORMATTER.format(dateTime);
    }

    private String safeValue(Object value, String fallback) {
        if (value == null) return fallback;
        if (value instanceof String s && !StringUtils.hasText(s)) return fallback;
        return String.valueOf(value);
    }
}

