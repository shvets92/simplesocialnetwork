package com.simplesocialnetwork.neo4j;

import org.neo4j.driver.v1.*;

import static org.neo4j.driver.v1.Values.parameters;

public class Graph implements AutoCloseable {
    private final Driver driver;

    public Graph(String graphUri, String graphUser, String graphPass) {
        driver = GraphDatabase.driver(graphUri, AuthTokens.basic(graphUser, graphPass));
    }

    @Override
    public void close() throws Exception {
        driver.close();
    }

    public StatementResult read(final String query, String... parameters) {
        try (Session session = driver.session()) {
            return session.readTransaction(new TransactionWork<StatementResult>() {
                @Override
                public StatementResult execute(Transaction tx) {
                    StatementResult results = tx.run(query,
                            parameters(parameters));

                    return results;
                }
            });
        }
    }

    public StatementResult readPage(final String query, String pageToken, int pageSize, String... parameters) {
        if (parameters.length == 2) {
            try (Session session = driver.session()) {
                return session.readTransaction(new TransactionWork<StatementResult>() {
                    @Override
                    public StatementResult execute(Transaction tx) {
                        StatementResult results = tx.run(query,
                                parameters("pageToken", pageToken, "pageSize", pageSize, parameters[0], parameters[1]));

                        return results;
                    }
                });
            }
        } else if (parameters.length == 4) {
            try (Session session = driver.session()) {
                return session.readTransaction(new TransactionWork<StatementResult>() {
                    @Override
                    public StatementResult execute(Transaction tx) {
                        StatementResult results = tx.run(query,
                                parameters("pageToken", pageToken, "pageSize", pageSize, parameters[0], parameters[1], parameters[2], parameters[3]));

                        return results;
                    }
                });
            }
        } else {
            try (Session session = driver.session()) {
                return session.readTransaction(new TransactionWork<StatementResult>() {
                    @Override
                    public StatementResult execute(Transaction tx) {
                        StatementResult results = tx.run(query,
                                parameters("pageToken", pageToken, "pageSize", pageSize, parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]));

                        return results;
                    }
                });
            }
        }
    }

    public StatementResult write(final String query, String... parameters) {
        try (Session session = driver.session()) {
            return session.writeTransaction(new TransactionWork<StatementResult>() {
                @Override
                public StatementResult execute(Transaction tx) {
                    StatementResult results = tx.run(query,
                            parameters(parameters));
                    return results;
                }
            });
        }
    }
}
