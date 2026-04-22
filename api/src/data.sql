--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.10
-- Dumped by pg_dump version 9.6.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: _event; Type: TABLE; Schema: public; Owner: rebasedata
--

CREATE TABLE public._event (
    id smallint,
    created_by_user_id smallint,
    price smallint,
    currency character varying(3) DEFAULT NULL::character varying,
    title character varying(28) DEFAULT NULL::character varying,
    description character varying(55) DEFAULT NULL::character varying,
    created_at character varying(1) DEFAULT NULL::character varying,
    updated_at character varying(1) DEFAULT NULL::character varying
);


ALTER TABLE public._event OWNER TO rebasedata;

--
-- Name: _user; Type: TABLE; Schema: public; Owner: rebasedata
--

CREATE TABLE public._user (
    id smallint,
    name character varying(9) DEFAULT NULL::character varying,
    email character varying(21) DEFAULT NULL::character varying
);


ALTER TABLE public._user OWNER TO rebasedata;

--
-- Data for Name: _event; Type: TABLE DATA; Schema: public; Owner: rebasedata
--

COPY public._event (id, created_by_user_id, price, currency, title, description, created_at, updated_at) FROM stdin;
1	1	100	DKK	Copenhagen Coffee Crawl	A relaxed Saturday walk between 4 specialty cafés.		
2	1	150	DKK	After-Work Board Games Night	Drop in with friends or come solo.		
3	1	250	DKK	Beginner Pasta Workshop	Hands-on workshop: mix dough, roll sheets, shape pasta.		
\.


--
-- Data for Name: _user; Type: TABLE DATA; Schema: public; Owner: rebasedata
--

COPY public._user (id, name, email) FROM stdin;
1	Test User	test.user@example.com
\.


--
-- PostgreSQL database dump complete
--

