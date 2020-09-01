import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Redirect, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { FormattedMessage, injectIntl } from "react-intl";
import { ErrorMessage, Form, Formik } from "formik";
import _ from "lodash";

import { withStyles } from "@material-ui/styles";
import {
    Typography,
    Paper,
    TextField,
    Button
} from "@material-ui/core";

import { Snackbar } from "../Modals";
import Error from "../Error";
import Loader from "../Loader";

import client from "../../GraphQL/client";
import {
    QUERY_ITEM,
    QUERY_ITEMS,
    CREATE_ITEM
} from "../../GraphQL/queries/units";
import { UPDATE_ITEM, ADD_ITEM } from "../../GraphQL/mutations/units";

import validationSchema from "./validationSchema";
import { compose } from "../../utils";
import styles from "./Style";

const Unit = ({ match, intl, classes }) => {
    const { loading, error, data } = useQuery(
        match.params.id ? QUERY_ITEM : CREATE_ITEM,
        {
            variables: { permissions: [
                            "master farm", "master store", "master equipment", "master finance",
                            "master delivery", "master marketing"
                        ], id: match.params.id }
        }
    );

    const [redirect, setRedirect] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        setRedirect(null);
    }, [data.unit]);

    if (redirect) return <Redirect to={redirect} push />;
    if (error) return <Error error={error} />;
    if (loading) return <Loader />;

    const { unit: item } = data;

    return (
        <>
            <Typography variant="h2" component="h1" gutterBottom>
                {item ? (
                    <FormattedMessage
                        id="unit.update"
                        defaultMessage="Update unit"
                    />
                ) : (
                    <FormattedMessage
                        id="unit.create"
                        defaultMessage="Create unit"
                    />
                )}
            </Typography>
            <Formik
                onSubmit={(values, { setSubmitting, setFieldError }) => {
                    client
                        .mutate({
                            mutation: item ? UPDATE_ITEM : ADD_ITEM,
                            variables: {
                                id: item ? item.id : null,
                                titleRU: values.titleRU,
                                titleEN: values.titleEN
                            },
                            update: async (cache, result) => {
                                const data =
                                    result.data.addUnit ||
                                    result.data.updateUnit;
                                try {
                                    const cachedData = await cache.readQuery({
                                        query: QUERY_ITEMS,
                                        variables: { permissions: [
                            "master farm", "master store", "master equipment", "master finance",
                            "master delivery", "master marketing"
                        ] }
                                    });
                                    cache.writeQuery({
                                        query: QUERY_ITEMS,
                                        variables: { permissions: [
                            "master farm", "master store", "master equipment", "master finance",
                            "master delivery", "master marketing"
                        ] },
                                        data: {
                                            ...cachedData,
                                            units: _.uniqBy(
                                                [
                                                    ...cachedData.units,
                                                    data.unit
                                                ],
                                                "id"
                                            )
                                        }
                                    });
                                } catch (e) { }
                            }
                        })
                        .then(({ data: { addUnit, updateUnit } }) => {
                            const data = addUnit || updateUnit;
                            if (addUnit && addUnit.unit) {
                                setRedirect(`/units/unit/${data.unit.id}`);
                            } else if (updateUnit && updateUnit.unit) {
                                setShowSuccessMessage(true);
                            } else {
                                setFieldError(
                                    data.field,
                                    <FormattedMessage
                                        id={data.message}
                                        defaultMessage="Error"
                                    />
                                );
                            }
                            setSubmitting(false);
                        })
                        .catch(error => {
                            console.error(error);
                            setSubmitting(false);
                        });
                }}
                validationSchema={validationSchema}
                initialValues={{
                    titleRU: item ? item.titleRU : "",
                    titleEN: item ? item.titleEN : ""
                }}
                render={({
                    values,
                    errors,
                    touched,
                    handleChange,
                    isSubmitting
                }) => (
                    <Paper className={classes.paper}>
                        <Form>
                            <TextField
                                label={
                                    <FormattedMessage
                                        id="unit.titleRU"
                                        defaultMessage={`Name on russian`}
                                    />
                                }
                                name="titleRU"
                                value={values.titleRU}
                                onChange={handleChange}
                                error={errors.titleRU && touched.titleRU}
                                helperText={
                                    errors.titleRU &&
                                    touched.titleRU && (
                                        <ErrorMessage name="titleRU" />
                                    )
                                }
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label={
                                    <FormattedMessage
                                        id="unit.titleEN"
                                        defaultMessage={`Name on english`}
                                    />
                                }
                                name="titleEN"
                                value={values.titleEN}
                                onChange={handleChange}
                                error={errors.titleEN && touched.titleEN}
                                helperText={
                                    errors.titleEN &&
                                    touched.titleEN && (
                                        <ErrorMessage name="titleEN" />
                                    )
                                }
                                fullWidth
                                margin="normal"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                type={"submit"}
                                disabled={isSubmitting}
                                className={classes.button}
                            >
                                <FormattedMessage
                                    id="app.save"
                                    defaultMessage="Save"
                                />
                            </Button>
                        </Form>
                    </Paper>
                )}
            />
            <Snackbar
                open={showSuccessMessage}
                handleClose={() => setShowSuccessMessage(false)}
                variation={"success"}
            >
                <FormattedMessage
                    id="app.updatedSuccessfully"
                    defaultMessage="Updated successfully"
                />
            </Snackbar>
        </>
    );
};

Unit.propTypes = {
    classes: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
};

export default compose(
    withStyles(styles),
    injectIntl,
    withRouter
)(Unit);
