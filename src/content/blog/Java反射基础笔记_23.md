# Java反射基础笔记

**摘要**：
更新日志
2022-09-06 晡时 于 杭州

第一个版本
调整目录结构
快速入门
问题引入

根据配置文件re.properties的内容，创建对象并调用方法。

re.properties
classfullpath = com.waer.Cat
method = Do
Cat
package com.waer;

public class Cat {
    private String name = "猫猫";
    public void hi(){
        System.out.println("HI，我是可爱猫猫!");
    }

    public void Do(){
        System.out.println("猫猫拉粑粑");
    }
}
测试
package com.waer.reflection.question;

import com.waer.Cat;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io

**分类**：Java

**标签**：后端, Java

**发布时间**：2025-08-14T13:20:46

---

### 更新日志

2022-09-06  于 杭州

> - 第一个版本
> - 调整目录结构

****

****



## 快速入门

**问题引入**

> 根据配置文件re.properties的内容，创建对象并调用方法。

- re.properties

```properties
classfullpath = com.waer.Cat
method = Do
```

- Cat

```Java
package com.waer;

public class Cat {
    private String name = "猫猫";
    public void hi(){
        System.out.println("HI，我是可爱猫猫!");
    }

    public void Do(){
        System.out.println("猫猫拉粑粑");
    }
}
```

- 测试

```java
package com.waer.reflection.question;

import com.waer.Cat;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Properties;

@SuppressWarnings("all")
public class ReflectQuestion {
    public static void main(String[] args) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        //根据配置文件信息，创建Cat对象并调用其中的HI方法
        //1.传统方式
        Cat cat = new Cat();
        cat.hi();
        //2.使用IO流读取配置文件信息
        Properties properties = new Properties();
        properties.load(new FileInputStream("src\\re.properties"));
        String path = (String)properties.get("classfullpath");
        String method = properties.get("method").toString();
        System.out.println("classfullpath=" + path);
        System.out.println("method=" + method);

        //创建对象:行不通
       // new path()

        //3.使用反射机制解决
            //1.加载类，返回一个名为class的类
        Class aClass = Class.forName(path);
            //2.通过aClass得到所加载的类com.waer.Cat的对象实例
        Object o = aClass.newInstance();
            //3.通过类加载对象的方法
            //在反射中，可以把方法视为对象
        Method method1 = aClass.getMethod(method);
        System.out.println("===========反射调用方法===============");
            //4.通过方法对象调用方法
            method1.invoke(o);
    }
}
```

通过配置文件，在不修改源码的情况下来控制程序，符合设计模式中的开闭原则(ocp)。类似这样的需求在学习框架时特别常见。

## 反射原理

- 反射机制允许程序在执行期间借助于`Reflection`API取得任何类的内部信息(比如成员变量，构造器，成员方法等)，并操作对象的属性及方法，在框架和设计模式中也是应用广泛。
- 类加载完成之后，在堆中就产生一个`Class`类型的对象(一个类只有一个Class对象)，这个对象包含了类的完整信息。通过这个对象得到类的结构，这个对象就像一面镜子，通过镜子看到类的结构。

![](https://images.waer.ltd/img/反射原理.png)

> `Java`代码在编译完成之后生成对应的`.class`字节码文件，再通过来加载器将字节码文件对应的内容加载到堆中，称为`Class`类对象，该对象就是类的一个镜像反射，它包含了所有类的结构信息，在运行阶段，通过反射机制获取到`Class`类对象之后，使用其中的`API`就可以实现对这个对象的一系列操作了。

Java反射可以：

- 在运行时判断任意一个对象所属的类；
- 在运行时构造任意一个类的对象；
- 在运行时得到任意一个类所具有的所有的成员变量和方法；
- 在运行时调用任意一个对象的成员变量和方法；
- 生成动态代理；

反射相关的主要类：

1. `java.lang.Class`:代表一个类，Class对象表示某个类加载后在堆中的对象；
2. `java.lang.reflect.Mrthod`:代表类的方法；
3. `java.lang.reflect.Field`:代表类的成员变量；
4. `java.lang.reflect.Constructor`：代表类的构造方法；

> 代码演示

```java
package com.waer.reflection.question;

import com.waer.Cat;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Properties;

@SuppressWarnings("all")
public class ReflectQuestion {
    public static void main(String[] args) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, NoSuchMethodException, InvocationTargetException, NoSuchFieldException {
        //根据配置文件信息，创建Cat对象并调用其中的HI方法
        //1.传统方式
//        Cat cat = new Cat();
//        cat.hi();
        //2.使用IO流读取配置文件信息
        Properties properties = new Properties();
        properties.load(new FileInputStream("src\\re.properties"));
        String path = (String)properties.get("classfullpath");
        String method = properties.get("method").toString();
        System.out.println("classfullpath=" + path);
        System.out.println("method=" + method);

        //创建对象:行不通
       // new path()

        //3.使用反射机制解决
            //1.加载类，返回一个名为class的类
        Class aClass = Class.forName(path);
            //2.通过aClass得到所加载的类com.waer.Cat的对象实例
        Object o = aClass.newInstance();
            //3.通过类加载对象的方法
            //在反射种，可以把方法视为对象
        Method method1 = aClass.getMethod(method);
        System.out.println("===========反射调用方法===============");
            //4.通过方法对象调用方法
            method1.invoke(o);
        System.out.println("==============反射获取属性=============");
        Field sex = aClass.getField("sex");
        System.out.println(sex.get(o));
        System.out.println("============获取构造器================");
        //获取无参构造器
        System.out.println(aClass.getConstructor());
        //获取带参构造器:传入参数类型的class
        System.out.println(aClass.getConstructor(String.class));
    }
}
```

不过反射也是有一些缺点的，一个明显的不足就是它的执行时间会比较长，相对于传统的方式而言，但是可以通过一些手段进行一定的优化，尽管效果可能不是那么明显。

一个常用的优化方式就是免去权限检查，少了一个权限检查的步骤，速度自然就上来了。

## 免权限检查

- `Method`和`Field`、`Contructor`对象都有一个名为`setAccessible()`的方法。
- 该方法的作用是启动或者禁用访问安全检查的开关。
- `true`或者`false`表示开启或者关闭反射对象执行的访问权限检查。

 原因很简单，上述的几个对象都直接或者间接的继承了一个名为`AccessibleObject`的类。

![](https://images.waer.ltd/img/20220523150229.png)

```java
public final class Field extends AccessibleObject implements Member {
    //.....
}
public abstract class Executable extends AccessibleObject implements Member, GenericDeclaration {
    //....
}
public final class Method extends Executable {
    //....
}
public final class Constructor<T> extends Executable {
    //....
}
```

## Class类

- `Class`类也是类，也继承`Object`顶级父类(`JDK8`);`Class`类不能通过`new` 出来，而是创建出来的，对于某个类的`Class`类对象且在内存中只有一份，类只加载一次。

- 每个类的实例都会记得自己是由哪个`Class`类实例所生成的。

- `Class`对象是存放在堆中的。
- 类的字节码文件二进制数据是存放在方法区，有的地方称为类的元数据(包括方法代码、变量名、方法名、访问权限等)

![](https://images.waer.ltd/img/20220523152557.png)

> 注意，上图来自`JDK11`。

### Class类的常用方法

```java
package com.waer.reflection.question;

import com.waer.Cat;

import java.lang.reflect.Field;

@SuppressWarnings("all")
public class question_2 {
    public static void main(String[] args)  throws Exception{
        String ClassPath = "com.waer.Cat";
        Class<?> aClass = Class.forName(ClassPath);
        //1.输出Class对象
        System.out.println(aClass);
        //2.Class的运行时类型
        System.out.println(aClass.getClass());
        //3.获取该Class类对象反射对象的包名
        System.out.println(aClass.getPackage().getName());
        //4.获取类全类名
        System.out.println(aClass.getName());
        //5.创建实例对象
        Cat cat = (Cat)aClass.newInstance();
        System.out.println(cat);
        //6.获取对象的属性(非私有)
        Field sex = aClass.getField("sex");
        System.out.println(sex.get(cat));
        //7.通过反射给属性赋值
        sex.set(cat,"母猫");
        System.out.println(sex.get(cat));
        //8.获取属性组(多个属性同时获取到)
        Field[] fields = aClass.getFields();
        for (Field field : fields) {
            System.out.println("属性:" + field.getName() + " ");
        }       
    }
}
```

> 其他方法可以通过查看手册食用。

## 获取Class类对象

不同的阶段获取的方式不同：

- 在编译编译阶段:`Class.forName()`
- 在加载阶段:`类.class`
- 在运行阶段:`对象.getClass()`

另外，也可以通过类加载器来获取。

#### 代码演示

> 在已知一个类的全类名且该类在类路径下，可以通过`Class`类的静态方法`forName()`获取。
>
> 多用于配置文件读取。

```java
//方式一：forName()
String ClassPath = "com.waer.Cat";
Class<?> aClass = Class.forName(ClassPath);
System.out.println(aClass);
```

> 若已知具体的类，通过类的class获取，该方式最安全可靠，程序性能也较高；
>
> 多用于参数传递。

```java
//方式二:类名.class
System.out.println(Cat.class);
```

> 已知某个类的实例，调用该实例的`getClass()`方法获取`Class`对象，实例.
>
> 多用于通过创建好的对象，获取`Class`对象

```java
//方式三:对象.getClass
Cat cat = new Cat();
Class<? extends Cat> aClass1 = cat.getClass();
System.out.println(aClass1);
```

> 通过类加载器获取

```java
//方式四:通过类加载器获取
ClassLoader classLoader = cat.getClass().getClassLoader();
Class<?> aClass2 = classLoader.loadClass(ClassPath);
System.out.println(aClass2);
```

另外，对于基本数据类型可以直接通过特定的方式获取。

> 基本数据类型(byte char int long float double short boolean)通过类型.class获取

```java
//基本数据类型
Class<Integer> integerClass = int.class;
Class<Long> longClass = long.class;
Class<Boolean> booleanClass = boolean.class;
Class<Float> floatClass = float.class;
Class<Double> doubleClass = double.class;
Class<Character> characterClass = char.class;
Class<Byte> byteClass = byte.class;
Class<Short> shortClass = short.class;
```

> 基本数据类型的包装类通过：包装类.TYPE获取

```java
Class<Integer> type = Integer.TYPE;
Class<Double> type1 = Double.TYPE;
Class<Character> type2 = Character.TYPE;
```

## 类的动/静态加载

#### 基本概念

反射机制是通过Java实现动态语言的关键，也就是通过反射实现类动态加载。

1. 静态加载

> 程序编译时加载相关的类，如果没有则会报错，依赖性太强。也就是不管你代码逻辑中有没有执行到的部分，只要开始编译，就会对所有的代码进行语法检查，一旦发现某个代码块不存在就报错，编译结束。

2. 动态加载

> 运行时加载需要的类，如果运行时不用该类，即使该类并不存在，也不会报错，降低了依赖性，可以看到，动态加载起始刚好和静态加载相反，它取决于你运行时用到了哪些代码逻辑，用什么加载什么，即使代码中存在不存在的类或者代码块，只要本次运行用不到，那就不会抛异常，不影响正常编译和运行。

#### 加载时机

静态加载

- 当创建对象(new) 时。
- 当子类被加载时，父类也加载。
- 调用类中的静态成员时。

动态加载

- 通过反射。

## 类加载流程

![](https://images.waer.ltd/img/类加载流程.png)

## 获取类的构造信息

```java
@Test
public void test_api_1() throws Exception {
    Class<?> cls = Class.forName("com.waer.reflection.question.Person");
    /*getName:获取全类名*/
    System.out.println("getName:获取全类名");
    String name = cls.getName();
    System.out.println(name);
    /*getSimpleName:获取简单类名*/
    System.out.println("getSimpleName:获取简单类名");
    System.out.println(cls.getSimpleName());
    /*getFields:获取public修饰的属性，含本类和父类的*/
    System.out.println("getFields:获取public修饰的属性，含本类和父类的");
    Field[] fields = cls.getFields();
    for (Field field : fields) {
        System.out.println(field.getName());
    }
    /*getDeclaredFields:获取本类中所有的属性*/
    System.out.println("getDeclaredFields:获取本类中所有的属性");
    Field[] declaredFields = cls.getDeclaredFields();
    for (Field declaredField : declaredFields) {
        System.out.println(declaredField.getName());
    }
    /*getMethods:获取本类和父类所有的方法*/
    System.out.println("getMethods:获取本类和父类所有的方法");
    Method[] methods = cls.getMethods();
    for (Method method : methods) {
        System.out.println(method.getName());
    }
    /*getDeclaredMethods:获取所有public修饰的方法 */
    System.out.println("getDeclaredMethods:获取所有public修饰的方法");
    Method[] declaredMethods = cls.getDeclaredMethods();
    for (Method declaredMethod : declaredMethods) {
        System.out.println(declaredMethod.getName());
    }
    /*getConstructors:获取public修饰的构造器，包含本父类*/
    System.out.println("getConstructors:获取public修饰的构造器，包含本父类");
    Constructor<?>[] constructors = cls.getConstructors();
    for (Constructor constructor : constructors) {
        System.out.println(constructors);
    }

    /*getDeclaredConstructors:获取本类中所有构造器*/
    System.out.println("getDeclaredConstructors:获取本类中所有构造器");
    Constructor<?>[] declaredConstructors = cls.getDeclaredConstructors();
    for (Constructor<?> declaredConstructor : declaredConstructors) {
        System.out.println(declaredConstructors);
    }
    /*getPackage:返回包信息*/
    System.out.println("getPackage:返回包信息");
    Package aPackage = cls.getPackage();
    System.out.println(aPackage);
    /*getSuperClass:以Class形式返回父类信息*/
    System.out.println("getSuperClass:以Class形式返回父类信息");
    System.out.println(cls.getSuperclass());
    /*getINterfaces:以Class[]形式返回接口信息*/
    System.out.println("getINterfaces:以Class[]形式返回接口信息");
    System.out.println(cls.getInterfaces());
    /*getAnnotations：以Annotation[]形式返回注解信息*/
    System.out.println("getAnnotations：以Annotation[]形式返回注解信息");
    System.out.println(cls.getAnnotations());
}
```
