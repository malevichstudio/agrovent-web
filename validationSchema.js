import * as Yup from "yup";
import React from "react";
import { FormattedMessage } from "react-intl";

export default () =>
    Yup.object().shape({
        name: Yup.string().required(
            <FormattedMessage
                id="company.requiredName"
                defaultMessage="Name is required"
            />
        ),
        country: Yup.string().required(
            <FormattedMessage
                id="company.requiredCountry"
                defaultMessage="Country is required"
            />
        ),
        city: Yup.string().required(
            <FormattedMessage
                id="company.requiredCity"
                defaultMessage="City is required"
            />
        ),
        address: Yup.string().required(
            <FormattedMessage
                id="company.requiredAddress"
                defaultMessage="Address is required"
            />
        ),
        position: Yup.string().required(
            <FormattedMessage
                id="company.requiredPosition"
                defaultMessage="Position is required"
            />
        ),
        userId: Yup.number().min(
            1,
            <FormattedMessage
                id="company.requiredClient"
                defaultMessage="Client is required"
            />
        )
    });
