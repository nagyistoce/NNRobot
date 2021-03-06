﻿var mysql = require('./mysqlConnection.js');

var actualBuffer;
var actualPos;
var nlogic = 0;
var nimage = 0;
var nexplore = 0;
var cpu = 0;
var memory = 0;
var moments;
var predNav = "Thinking";
var probNav = 0;
var cluster;

var isTraining = false;
var rcost;
var rsecure;
var iterp = 0;
var iters = 0;
var lambdann = 0;
var maxiter = 0;
var accurExp = 0;


var validar = function (req) {
    var q = req.query;
    q.anio = q.anio == undefined ? "" : q.anio;
    q.facultad = q.facultad == undefined ? "" : q.facultad;
    q.estudios = q.estudios == undefined ? "" : q.estudios;
    q.departamento = q.departamento == undefined ? "" : q.departamento;
    q.programa = q.programa == undefined ? "" : q.programa;
    q.condicion = q.condicion == undefined ? "" : q.condicion;
}

var setData = function (req, res) {     
    var q = req.body;
    actualBuffer = q.buffer;
    actualPos = q.bufferpos;
    nlogic = q.nlogic;
    nimage = q.nimage;
    nexplore = q.nexplore;    
    cpu = q.cpu;
    memory = q.memory;
    predNav = q.predNav;
    probNav = q.probNav;
    res.json({ "ok": "200"})
};

var setDataSight = function (req, res) {
    var q = req.body;    
    moments = q.moments; 
    cluster = q.cluster; 
    res.json({ "ok": "200" })
};

var setDataNnet = function (req, res) {
    var q = req.body;    
    isTraining = q.isTraining;
    if (isTraining != "False") {
        rcost = q.rcost;
        rsecure = q.rsecure;
        iterp = q.iterp;
        iters = q.iters;
        lambdann = q.lambdann;
        maxiter = q.maxiter;
        accurExp = q.accurExp;
    }
    res.json({ "ok": "200" })
};

var getLaser = function (req, res) {    
    res.json({"buffer":actualBuffer})
};

var getPositions = function (req, res) {
    res.json({ "buffer": actualPos })
};

var getKmeans = function (req, res) {
    res.json({
        "buffer": cluster        
    })
};

var getPredNav = function (req, res) {
    res.json({
        "predNav": predNav,
        "probNav": probNav
    })
};

var getNneTraining = function (req,res) {
    res.json({
        "isTraining": isTraining,
        "rcost" : rcost,
        "rsecure" : rsecure,
        "iterp": iterp,
        "iters": iters,
        "lambdann" : lambdann,
        "maxiter" : maxiter,
        "accurExp" : accurExp
    })
};

var getMoments = function (req, res) {
    res.json({"buffer": moments})
};

var getParalelInfo = function (req, res) {
    validar(req);
    var q = req.query;
    mysql.handle_database(req, res, promedio(q.anio,q.estudios,q.facultad,q.departamento,q.programa,q.condicion));
};

var getParalelSI = function (req, res) {    
    var q = req.query;
    t = q.thread;
    if (t == "logic") {
        res.json({ "ips": nlogic })
    }
    if (t == "image") {
        res.json({ "ips": nimage })
    }
    if (t == "explore") {
        res.json({ "ips": nexplore })
    } 
    if (t == "cpu") {
        res.json({ "ips": cpu })
    } 
    if (t == "memory") {
        res.json({ "ips": memory })
    }   
};

var getTree = function (req, res) {  
    mysql.handle_database(req, res,tree);
};

var getRTotal = function (req, res)
{
    validar(req);
    var q = req.query;
    mysql.handle_database(req, res, resumenTotal(q.anio, q.estudios, q.facultad, q.departamento, q.programa, q.condicion));
}; 

module.exports.getLaser = getLaser;
module.exports.getPositions = getPositions;
module.exports.setData = setData;
module.exports.setDataSight = setDataSight;
module.exports.setDataNnet = setDataNnet;
module.exports.getParalelSI = getParalelSI;
module.exports.getKmeans = getKmeans;
module.exports.getMoments = getMoments;
module.exports.getNneTraining = getNneTraining;
module.exports.getPredNav = getPredNav;

