function inherit(subType, superType)
{
    var p = Object.create(superType.prototype);
    p.constructor = subType;
    subType.prototype = p;
}


function shape(vertices, vertex_normals, true_normals, tex_coords, indices, indexed )
{
    this.vertices = vertices;
    this.vertex_normals = vertex_normals;
    this.true_normals = true_normals;
    this.tex_coords = tex_coords;
    this.indices = indices;
    this.indexed = indexed;
}

    shape.prototype.flat_normals_from_triples = function()
        {
            //var topIdx = this.topIdx;
            //var bottomIdx = this.bottomIdx;
            console.log(this.indices.length);
            for( var counter = 0; counter < this.indices.length / 3; counter++ )
            {
				console.log("i am here" + counter);

                var a = this.vertices[ this.indices[ counter * 3 ] ];
                var b = this.vertices[ this.indices[ counter * 3 + 1 ] ];
                var c = this.vertices[ this.indices[ counter * 3 + 2 ] ];
                        
                var triangleNormal = normalize( cross( subtract(a, b), subtract(c, a)) );
                if( length( add( vec4(triangleNormal, 0), a) ) < length(a) )
                        triangleNormal *= -1;
                
                this.vertex_normals.push( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 );
                this.vertex_normals.push( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 );
                this.vertex_normals.push( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 );
                if( this.indexed )
                {
            		
                    this.true_normals.push( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 );
                    this.true_normals.push( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 );
                    this.true_normals.push( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 );
                }
            }
        };
    
    shape.prototype.init_buffers = function ()
        {
            this.position_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW); 
            
            this.texCoord_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tex_coords), gl.STATIC_DRAW); 


            this.normal_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertex_normals), gl.STATIC_DRAW); 

            if( this.indexed )
            {
                this.index_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);
            }
        };
    
    
    shape.prototype.update_uniforms = function(model_transform)
    {

            gl.activeTexture(gl.TEXTURE2);
            gl.uniform1i(useTextureLoc, false);
            gl.uniformMatrix4fv(modelLoc, false, flatten(model_transform) );
            
            gl.uniformMatrix4fv(cameraLoc, false, flatten(cameraTransform) );
            gl.uniformMatrix4fv(projectionLoc, false, flatten(perspective( 45.0, canvas.width/canvas.height, near, far )));

    };
    
    shape.prototype.draw = function(model_transform)
    {       
        this.update_uniforms(model_transform);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoord_buffer);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
       
        if( this.indexed )          
            gl.drawElements( gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0 );
        else
            gl.drawArrays( gl.TRIANGLES, 0, this.vertices.length );
    };


function sphere()
{
    
    var vertices = [];
    var vertex_normals = [];
    var true_normals = [];
    var tex_coords = [];
    var indices = [];
    var indexed = false;
    
    shape.call(this, vertices, vertex_normals, true_normals, tex_coords, indices, indexed );
    
    var a = vec4(0.0, 0.0, -1.0,1);
    var b = vec4(0.0, 0.942809, 0.333333, 1);
    var c = vec4(-0.816497, -0.471405, 0.333333, 1);
    var d = vec4(0.816497, -0.471405, 0.333333,1);
    
    
    
    this.numTimesToSubdivide = 4;
    
    this.triangle = function(a, b, c) 
        {
             this.vertices.push(a);
             this.vertices.push(b);      
             this.vertices.push(c);
             
             var u = 0.5 + Math.atan2(a[2], a[0])/(2*Math.PI);
             var v = 0.5 - Math.asin(a[1])/Math.PI;
             this.tex_coords.push(vec2( u, v) );
             
             u = 0.5 + Math.atan2(b[2], b[0])/(2*Math.PI);
             v = 0.5 - Math.asin(b[1])/Math.PI;
             this.tex_coords.push(vec2( u, v) );

             u = 0.5 + Math.atan2(c[2], c[0])/(2*Math.PI);
             v = 0.5 - Math.asin(c[1])/Math.PI;
             this.tex_coords.push(vec2( u, v) );

             

             this.true_normals.push(vec4( a[0],a[1], a[2], 0.0) );
             this.true_normals.push(vec4( b[0],b[1], b[2], 0.0) );
             this.true_normals.push(vec4( c[0],c[1], c[2], 0.0) );

             triangleNormal = normalize( cross( subtract(a, b), subtract(c, a)) );
             if( length( add( vec4(triangleNormal, 0), a) ) < length(a) )
                    triangleNormal *= -1;
           
             this.vertex_normals.push( vec4( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 ) );
             this.vertex_normals.push( vec4( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 ) );
             this.vertex_normals.push( vec4( triangleNormal[0], triangleNormal[1], triangleNormal[2], 0.0 ) );
        }


    this.divideTriangle = function(a, b, c, count) 
        {
            if ( count > 0 ) {
                        
                var ab = mix( a, b, 0.5);
                var ac = mix( a, c, 0.5);
                var bc = mix( b, c, 0.5);
                        
                ab = normalize(ab, true);
                ac = normalize(ac, true);
                bc = normalize(bc, true);
                                        
                this.divideTriangle( a, ab, ac, count - 1 );
                this.divideTriangle( ab, b, bc, count - 1 );
                this.divideTriangle( bc, c, ac, count - 1 );
                this.divideTriangle( ab, bc, ac, count - 1 );
            }
            else { 
                this.triangle( a, b, c );
            }
        }
    
    
    this.populate_vertices = ( function (self) 
        {
            self.divideTriangle(a, b, c, self.numTimesToSubdivide);
            self.divideTriangle(d, c, b, self.numTimesToSubdivide);
            self.divideTriangle(a, d, b, self.numTimesToSubdivide);
            self.divideTriangle(a, c, d, self.numTimesToSubdivide); 
        } 
        )(this);
        
    this.init_buffers();
}
inherit(sphere, shape);




function cube()
{
    
    var vertex_normals = [];
    var true_normals = [];
    var indexed = true;

     var vertices = [
        vec4( -0.5, -0.5,  0.5, 1 ),
        vec4( -0.5,  0.5,  0.5, 1 ),
        vec4(  0.5,  0.5,  0.5, 1 ),
        vec4(  0.5, -0.5,  0.5, 1 ),
        vec4( -0.5, -0.5, -0.5, 1 ),
        vec4( -0.5,  0.5, -0.5, 1 ),
        vec4(  0.5,  0.5, -0.5, 1 ),
        vec4(  0.5, -0.5, -0.5, 1 )
    ];

    var indices = [
        1, 0, 3,
        3, 2, 1,
        2, 3, 7,
        7, 6, 2,
        3, 0, 4,
        4, 7, 3,
        6, 5, 1,
        1, 2, 6,
        4, 5, 6,
        6, 7, 4,
        5, 4, 0,
        0, 1, 5
    ];
    
    shape.call(this, vertices, vertex_normals, true_normals, indices, indexed );
    this.flat_normals_from_triples();
    this.init_buffers();
}
inherit(cube, shape);





function shape_from_file(filename)
{
    
    var vertices = [ ];
    var vertex_normals = [];
    var true_normals = [];
    var tex_coords = [];
    var indexed = true;
    var indices = [ ];

        
    this.filename = filename;

    this.webGLStart = function(meshes, self)
    {
        
      for( var i = 0; i < meshes.mesh.vertices.length; i += 3 )
      {
            self.vertices.push( vec4( meshes.mesh.vertices[i], meshes.mesh.vertices[i+1], meshes.mesh.vertices[i+2], 1) );            
      }


      for( var i = 0; i < meshes.mesh.textures.length; i += 2 )
      {
      		self.tex_coords.push( vec2(meshes.mesh.textures[i], meshes.mesh.textures[i+1]));
      }

      self.indices  = meshes.mesh.indices;   
		self.flat_normals_from_triples();
		self.init_buffers(); 
    }
    
    shape.call(this, vertices, vertex_normals, true_normals, tex_coords, indices, indexed );
    



    OBJ.downloadMeshes({
        'mesh' : filename, // located in the models folder on the server
        }, this.webGLStart, undefined, this);
      
    
}
inherit(shape_from_file, shape);
