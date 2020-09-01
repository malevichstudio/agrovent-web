import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { FormattedMessage, injectIntl } from "react-intl";

import { withStyles } from "@material-ui/styles";
import {
    Typography,
    Table,
    TableSortLabel,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Fab
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";

import Error from "../Error";
import Loader from "../Loader";
import Empty from "../Empty";
import { DeletePopup, Snackbar } from "../Modals";

import client from "../../GraphQL/client";
import { QUERY_ITEMS } from "../../GraphQL/queries/categories";
import { DELETE_ITEM } from "../../GraphQL/mutations/categories";

import { requestSort, sort, formatDateTime, compose } from "../../utils";
import styles from "./Style";

const Categories = ({ classes, intl }) => {
    const { loading, error, data } = useQuery(QUERY_ITEMS, {
        variables: { permissions: ["admin"] }
    });

    const [state, setState] = useState({
        orderBy: "id",
        order: "asc",
        snackbar: {
            open: false,
            message: "",
            variation: ""
        },
        deleted: []
    });

    const handleCloseSnackbar = () => {
        setState({
            ...state,
            snackbar: {
                ...state.snackbar,
                open: false
            }
        });
    };

    const handleDelete = id => async () => {
        await client
            .mutate({
                mutation: DELETE_ITEM,
                variables: { id },
                update: async (cache, result) => {
                    if (result.data.deleteCategory.status) {
                        const { deleted } = state;
                        const cachedData = await cache.readQuery({
                            query: QUERY_ITEMS,
                            variables: { permissions: ["admin"] }
                        });
                        await cache.writeQuery({
                            query: QUERY_ITEMS,
                            variables: { permissions: ["admin"] },
                            data: {
                                ...cachedData,
                                categories: cachedData.categories.filter(
                                    i => i.id !== id
                                )
                            }
                        });
                        deleted.push(id);
                        setState({
                            ...state,
                            deleted,
                            snackbar: {
                                open: true,
                                message: (
                                    <FormattedMessage
                                        id="app.deletedSuccessfully"
                                        defaultMessage="Deleted successfully"
                                    />
                                ),
                                variation: "success"
                            }
                        });
                    } else {
                        setState({
                            ...state,
                            snackbar: {
                                open: true,
                                message: (
                                    <FormattedMessage
                                        id={result.data.deleteCategory.message}
                                        defaultMessage="Error occurred"
                                    />
                                ),
                                variation: "error"
                            }
                        });
                    }
                }
            })
            .catch(e => console.error(e));
    };

    if (error) return <Error error={error} />;
    if (loading) return <Loader />;

    const { categories: list } = data;
    const { orderBy, order, deleted, snackbar } = state;

    const tableCells = [
        { id: "id", label: "ID" },
        {
            id: `title${intl.locale.toUpperCase()}`,
            label: (
                <FormattedMessage id="categories.name" defaultMessage="Title" />
            )
        },
        {
            id: "parent",
            label: (
                <FormattedMessage
                    id="categories.parent"
                    defaultMessage="Parent category"
                />
            )
        },
        {
            id: "createdAt",
            label: (
                <FormattedMessage
                    id="categories.createdAt"
                    defaultMessage="Created at"
                />
            )
        }
    ];

    return (
        <>
            <Typography variant="h2" component="h1" gutterBottom>
                <FormattedMessage
                    id="categories.title"
                    defaultMessage="Categories"
                />
            </Typography>
            <Paper className={classes.paper}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            {tableCells.map(({ id, label }) => (
                                <TableCell
                                    key={id}
                                    sortDirection={
                                        orderBy === id ? order : false
                                    }
                                >
                                    <TableSortLabel
                                        active={orderBy === id}
                                        direction={order}
                                        onClick={() =>
                                            requestSort(id, state, setState)
                                        }
                                    >
                                        {label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {list.length ? (
                            list
                                .sort(sort(order, orderBy))
                                .filter(i => deleted.indexOf(i.id) === -1)
                                .map(el => (
                                    <TableRow key={el.id}>
                                        <TableCell component="th" scope="row">
                                            {el.id}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {
                                                el[
                                                    `title${intl.locale.toUpperCase()}`
                                                ]
                                            }
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {el.parent ? (
                                                el.parent[
                                                    `title${intl.locale.toUpperCase()}`
                                                ]
                                            ) : (
                                                <FormattedMessage
                                                    id="app.no"
                                                    defaultMessage="No"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {formatDateTime(
                                                parseInt(el.createdAt)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={classes.icons}>
                                                <Fab
                                                    color="primary"
                                                    aria-label="edit"
                                                    component={Link}
                                                    to={`/categories/category/${el.id}`}
                                                >
                                                    <EditIcon />
                                                </Fab>
                                                <DeletePopup
                                                    callback={handleDelete(
                                                        el.id
                                                    )}
                                                />
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Empty />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
            <Fab
                color="primary"
                aria-label="add"
                className={classes.addIcon}
                component={Link}
                to={"/categories/category"}
            >
                <AddIcon />
            </Fab>
            <Snackbar
                open={snackbar.open}
                handleClose={handleCloseSnackbar}
                variation={snackbar.variation}
            >
                {snackbar.message}
            </Snackbar>
        </>
    );
};

Categories.propTypes = {
    classes: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired
};

export default compose(
    withStyles(styles),
    injectIntl
)(Categories);
