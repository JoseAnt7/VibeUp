import React from "react";
import { EmailLayout } from "./EmailLayout";

const MOCK = {
    username: "carlos_demo",
    changedAt: "2 de abril de 2026, 18:15",
    device: "Chrome en Windows",
    approximateLocation: "Valencia, ES"
};

export function EmailPasswordChanged() {
    return (
        <EmailLayout metaLabel="Seguridad" title="Contraseña actualizada">
            <p className="email-template__greeting">Hola {MOCK.username},</p>
            <p>Te confirmamos que la contraseña de tu cuenta se ha cambiado correctamente.</p>
            <div className="email-template__card">
                <p className="email-template__card-title">Detalle del cambio (prueba)</p>
                <table className="email-template__table">
                    <tbody>
                        <tr>
                            <th scope="row">Fecha y hora</th>
                            <td>{MOCK.changedAt}</td>
                        </tr>
                        <tr>
                            <th scope="row">Dispositivo / navegador</th>
                            <td>{MOCK.device}</td>
                        </tr>
                        <tr>
                            <th scope="row">Ubicación aproximada</th>
                            <td>{MOCK.approximateLocation}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="email-template__muted">
                Si no has sido tú, restablece la contraseña de inmediato y revisa la actividad de tu cuenta.
            </p>
            <a className="email-template__btn" href="/session">
                Ir a la cuenta
            </a>
        </EmailLayout>
    );
}
