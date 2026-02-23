package com.turmalin.productsapi.reservations.email;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.reservations.email")
public class ReservationEmailProperties {

    private boolean enabled = true;
    private String from = "";
    private String providerContactName = "Soporte Turmalin";
    private String providerContactEmail = "soporte@turmalin.com";
    private String providerContactPhone = "+54 11 4000-0000";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getProviderContactName() {
        return providerContactName;
    }

    public void setProviderContactName(String providerContactName) {
        this.providerContactName = providerContactName;
    }

    public String getProviderContactEmail() {
        return providerContactEmail;
    }

    public void setProviderContactEmail(String providerContactEmail) {
        this.providerContactEmail = providerContactEmail;
    }

    public String getProviderContactPhone() {
        return providerContactPhone;
    }

    public void setProviderContactPhone(String providerContactPhone) {
        this.providerContactPhone = providerContactPhone;
    }
}
