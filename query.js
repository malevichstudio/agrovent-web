import gql from "graphql-tag";

export const QUERY_ITEMS = gql`
    query companies($permissions: [String!]!) {
        checkPermissions(permissions: $permissions)
        companies {
            id
            name
            country
            city
            address
            position
            user {
                id
                email
            }
            createdAt
        }
    }
`;

export const QUERY_ITEM = gql`
    query company($permissions: [String!]!, $id: ID!) {
        checkPermissions(permissions: $permissions)
        clients {
            id
            email
        }
        company(id: $id) {
            id
            name
            country
            city
            address
            position
            user {
                id
                email
            }
        }
    }
`;

